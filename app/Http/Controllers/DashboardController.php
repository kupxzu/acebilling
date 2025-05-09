<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\Admission;
use Carbon\Carbon;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats()
    {
        try {
            $today = Carbon::today();
            
            // Get weekly data with proper Carbon dates
            $weeklyData = Patient::selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->whereBetween('created_at', [
                    $today->copy()->subDays(6)->startOfDay(),
                    $today->endOfDay()
                ])
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->map(function ($item) {
                    return [
                        'date' => Carbon::parse($item->date)->format('Y-m-d'),
                        'count' => (int)$item->count
                    ];
                });

            // Get monthly data
            $monthlyData = Patient::selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->whereBetween('created_at', [
                    $today->copy()->startOfMonth(),
                    $today->copy()->endOfMonth()
                ])
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->map(function ($item) {
                    return [
                        'date' => Carbon::parse($item->date)->format('Y-m-d'),
                        'count' => (int)$item->count
                    ];
                });

            // Get yearly data
            $yearlyData = Patient::selectRaw('DATE_FORMAT(created_at, "%Y-%m-01") as date, COUNT(*) as count')
                ->whereYear('created_at', $today->year)
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->map(function ($item) {
                    return [
                        'date' => Carbon::parse($item->date)->format('Y-m-d'),
                        'count' => (int)$item->count
                    ];
                });

            $stats = [
                'totalPatients' => Patient::count(),
                'activeAdmissions' => Admission::where('status', 'active')->count(),
                'dischargedPatients' => Admission::where('status', 'discharged')->count(),
                
                'admissionTrend' => Admission::selectRaw('DATE(created_at) as date, COUNT(*) as count')
                    ->whereBetween('created_at', [
                        $today->copy()->subDays(6),
                        $today
                    ])
                    ->groupBy('date')
                    ->orderBy('date')
                    ->get()
                    ->map(function ($item) {
                        return [
                            'date' => Carbon::parse($item->date)->format('Y-m-d'),
                            'count' => (int)$item->count
                        ];
                    }),
                
                'wardDistribution' => [
                    'private' => Admission::where('ward_type', 'private')
                        ->where('status', 'active')->count(),
                    'semiPrivate' => Admission::where('ward_type', 'semi-private')
                        ->where('status', 'active')->count(),
                    'ward' => Admission::where('ward_type', 'ward')
                        ->where('status', 'active')->count()
                ],
                
                'patientTrend' => [
                    'weekly' => $weeklyData,
                    'monthly' => $monthlyData,
                    'yearly' => $yearlyData
                ],
                
                'recentPatients' => Patient::with(['admissions' => function($query) {
                    $query->latest();
                }])
                ->latest()
                ->take(3)
                ->get()
                ->map(function ($patient) {
                    return [
                        'id' => $patient->id,
                        'name' => $patient->name,
                        'room_number' => $patient->room_number,
                        'admission_date' => $patient->admissions->first() 
                            ? $patient->admissions->first()->created_at->format('Y-m-d')
                            : null
                    ];
                })
            ];

            return response()->json([
                'status' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            \Log::error('Dashboard stats error:', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch dashboard stats'
            ], 500);
        }
    }
}