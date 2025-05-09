<?php

namespace App\Http\Controllers;

use App\Models\Admission;
use App\Models\Billing;
use App\Models\Patient;
use Illuminate\Http\Request;
use PDF;

class BillingController extends Controller
{
    public function dashboard()
    {
        $recentAdmissions = Admission::with('patient')
            ->where('status', 'active')
            ->latest()
            ->take(10)
            ->get();

        $stats = [
            'totalRevenue' => Billing::sum('amount'),
            'pendingBills' => Billing::where('status', 'pending')->count(),
            'paidBills' => Billing::where('status', 'paid')->count()
        ];

        return response()->json([
            'status' => true,
            'data' => [
                'recentAdmissions' => $recentAdmissions,
                'stats' => $stats
            ]
        ]);
    }

    public function getDashboardStats()
    {
        try {
            $stats = [
                'totalRevenue' => Billing::where('status', 'paid')->sum('amount'),
                'pendingPayments' => Billing::where('status', 'pending')->sum('amount'),
                'activePatients' => Patient::whereHas('admissions', function($query) {
                    $query->where('status', 'active');
                })->count()
            ];

            $recentTransactions = Billing::with(['admission.patient'])
                ->latest()
                ->take(10)
                ->get()
                ->map(function($billing) {
                    return [
                        'id' => $billing->id,
                        'created_at' => $billing->created_at,
                        'patient_name' => $billing->admission->patient->name,
                        'description' => $billing->description,
                        'amount' => $billing->amount,
                        'status' => $billing->status
                    ];
                });

            return response()->json([
                'status' => true,
                'stats' => $stats,
                'recent_transactions' => $recentTransactions
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch dashboard statistics'
            ], 500);
        }
    }

    public function getSOA($id)
    {
        try {
            $admission = Admission::with(['patient', 'billings'])
                ->findOrFail($id);

            $charges = $admission->billings;
            $charges_by_category = $charges->groupBy('category')
                ->map(function ($items) {
                    return $items->sum('amount');
                });

            return response()->json([
                'status' => true,
                'data' => [
                    'patient' => $admission->patient,
                    'charges' => $charges,
                    'charges_by_category' => $charges_by_category,
                    'summary' => [
                        'total' => $charges->sum('amount'),
                        'paid' => $charges->where('status', 'paid')->sum('amount'),
                        'balance' => $charges->where('status', 'pending')->sum('amount')
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch SOA data'
            ], 500);
        }
    }

    public function downloadSOA($id)
    {
        try {
            $admission = Admission::with(['patient', 'billings'])
                ->findOrFail($id);

            $charges = $admission->billings;
            $charges_by_category = $charges->groupBy('category')
                ->map(function ($items) {
                    return $items->sum('amount');
                });

            $data = [
                'admission' => $admission,
                'patient' => $admission->patient,
                'charges' => $charges,
                'charges_by_category' => $charges_by_category,
                'summary' => [
                    'total' => $charges->sum('amount'),
                    'paid' => $charges->where('status', 'paid')->sum('amount'),
                    'balance' => $charges->where('status', 'pending')->sum('amount')
                ]
            ];

            $pdf = PDF::loadView('billing.soa', $data);
            
            return $pdf->download('SOA-'.$admission->id.'.pdf', [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => 'attachment; filename="SOA-'.$admission->id.'.pdf"'
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to generate SOA: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to generate SOA'
            ], 500);
        }
    }

    public function getProgressBill($id)
    {
        try {
            $admission = Admission::with(['patient', 'billings'])
                ->findOrFail($id);

            $charges = $admission->billings()
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'status' => true,
                'data' => [
                    'patient' => $admission->patient,
                    'charges' => $charges,
                    'total' => $charges->sum('amount')
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch progress bill'
            ], 500);
        }
    }

    public function addCharge(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'description' => 'required|string',
                'amount' => 'required|numeric',
                'category' => 'required|in:room,medicine,laboratory,professional_fee,others'
            ]);

            $admission = Admission::findOrFail($id);
            
            $billing = $admission->billings()->create([
                'description' => $validated['description'],
                'amount' => $validated['amount'],
                'category' => $validated['category'],
                'status' => 'pending'
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Charge added successfully',
                'data' => $billing
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to add charge'
            ], 500);
        }
    }

    public function updateChargeStatus(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'status' => 'required|in:pending,paid,cancelled'
            ]);

            $charge = Billing::findOrFail($id);
            $charge->status = $validated['status'];
            $charge->save();

            return response()->json([
                'status' => true,
                'message' => 'Charge status updated successfully',
                'data' => $charge
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to update charge status'
            ], 500);
        }
    }

    public function getPatientCharges($patientId)
    {
        try {
            $charges = Billing::whereHas('admission', function($query) use ($patientId) {
                $query->where('patient_id', $patientId)
                      ->where('status', 'active');
            })
            ->orderBy('created_at', 'desc')
            ->get();

            return response()->json([
                'status' => true,
                'data' => $charges
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch patient charges'
            ], 500);
        }
    }

    public function getPatients()
    {
        try {
            $patients = Patient::with(['admissions' => function($query) {
                $query->latest();
            }])
            ->whereHas('admissions', function($query) {
                $query->where('status', 'active');
            })
            ->select('patients.*')
            ->selectRaw('(SELECT SUM(amount) FROM billings WHERE admission_id IN (SELECT id FROM admissions WHERE patient_id = patients.id)) as total_bill')
            ->orderBy('created_at', 'desc')
            ->paginate(10);

            return response()->json([
                'status' => true,
                'data' => $patients->items(),
                'meta' => [
                    'current_page' => $patients->currentPage(),
                    'last_page' => $patients->lastPage(),
                    'total' => $patients->total(),
                    'per_page' => $patients->perPage()
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch patients'
            ], 500);
        }
    }

    public function getActivePatients()
    {
        try {
            $patients = Patient::with(['activeAdmission' => function($query) {
                    $query->select('id', 'patient_id', 'room_number', 'created_at', 'status');
                }])
                ->whereHas('admissions', function($query) {
                    $query->where('status', 'active');
                })
                ->select('id', 'name')
                ->get()
                ->map(function($patient) {
                    return [
                        'id' => $patient->id,
                        'name' => $patient->name,
                        'room_number' => $patient->activeAdmission->room_number ?? null,
                        'admission_date' => $patient->activeAdmission->created_at ?? null
                    ];
                });

            return response()->json([
                'status' => true,
                'data' => $patients
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch active patients: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch active patients'
            ], 500);
        }
    }

    public function getReports(Request $request)
    {
        try {
            $range = $request->query('range', 'week');
            $now = now();

            // Define date range
            $startDate = match($range) {
                'month' => $now->copy()->startOfMonth(),
                'year' => $now->copy()->startOfYear(),
                default => $now->copy()->startOfWeek(),
            };

            // Get revenue data
            $revenue = Billing::where('created_at', '>=', $startDate)
                ->selectRaw('DATE(created_at) as date, SUM(amount) as total')
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            // Get category data
            $categories = Billing::where('created_at', '>=', $startDate)
                ->selectRaw('category, SUM(amount) as total')
                ->groupBy('category')
                ->get();

            // Get payment status data
            $paymentStatus = Billing::where('created_at', '>=', $startDate)
                ->selectRaw('status, COUNT(*) as count, SUM(amount) as total')
                ->groupBy('status')
                ->get();

            return response()->json([
                'status' => true,
                'data' => [
                    'revenue' => [
                        'labels' => $revenue->pluck('date'),
                        'datasets' => [
                            [
                                'label' => 'Daily Revenue',
                                'data' => $revenue->pluck('total'),
                                'borderColor' => '#4F46E5',
                                'tension' => 0.1
                            ]
                        ]
                    ],
                    'categories' => [
                        'labels' => $categories->pluck('category')->map(function($category) {
                            return ucfirst(str_replace('_', ' ', $category));
                        }),
                        'datasets' => [
                            [
                                'data' => $categories->pluck('total'),
                                'backgroundColor' => [
                                    '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'
                                ]
                            ]
                        ]
                    ],
                    'payment_status' => [
                        'labels' => $paymentStatus->pluck('status')->map(function($status) {
                            return ucfirst($status);
                        }),
                        'datasets' => [
                            [
                                'label' => 'Amount',
                                'data' => $paymentStatus->pluck('total'),
                                'backgroundColor' => '#4F46E5'
                            ]
                        ]
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Reports Error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to generate reports'
            ], 500);
        }
    }
}