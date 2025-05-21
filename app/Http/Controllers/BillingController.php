<?php

namespace App\Http\Controllers;

use App\Models\Admission;
use App\Models\Billing;
use App\Models\Patient;
use Illuminate\Http\Request;
use PDF;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;

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

public function getDashboardStats(Request $request)
{
    try {
        $timeRange = $request->query('range', 'today');
        $now = now();

        // Define date range based on selected filter
        $startDate = match($timeRange) {
            'week' => $now->copy()->startOfWeek(),
            'month' => $now->copy()->startOfMonth(),
            'year' => $now->copy()->startOfYear(),
            default => $now->copy()->startOfDay(),
        };

        // Get previous period for comparison
        $previousStart = match($timeRange) {
            'week' => $now->copy()->subWeek()->startOfWeek(),
            'month' => $now->copy()->subMonth()->startOfMonth(),
            'year' => $now->copy()->subYear()->startOfYear(),
            default => $now->copy()->subDay()->startOfDay(),
        };
        $previousEnd = $startDate;

        // Fix the ward statistics query
        $wardStats = \DB::table('admissions AS a')
            ->where('a.status', 'active')
            ->select('a.ward_type')
            ->selectRaw('COUNT(*) as patient_count')
            ->selectRaw('COALESCE((SELECT SUM(b.amount) FROM billings b JOIN admissions adm ON b.admission_id = adm.id WHERE adm.ward_type = a.ward_type), 0) as revenue')
            ->groupBy('a.ward_type')
            ->get()
            ->mapWithKeys(function ($item) {
                $key = str_replace('-', '', lcfirst(ucwords($item->ward_type, '-')));
                return [
                    $key => [
                        'patients' => (int)$item->patient_count,
                        'revenue' => (float)$item->revenue
                    ]
                ];
            });

        // Default ward types if none found
        $defaultWards = [
            'private' => ['patients' => 0, 'revenue' => 0],
            'semiPrivate' => ['patients' => 0, 'revenue' => 0],
            'ward' => ['patients' => 0, 'revenue' => 0],
            'executive' => ['patients' => 0, 'revenue' => 0],
            'suite' => ['patients' => 0, 'revenue' => 0]
        ];

        // Merge with defaults to ensure all ward types exist
        $wardStats = collect($defaultWards)->merge($wardStats);

        // Get income data for the period
        $incomeData = Billing::where('created_at', '>=', $startDate)
            ->selectRaw('DATE(created_at) as date')
            ->selectRaw('COALESCE(SUM(amount), 0) as amount')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(function ($item) {
                return [
                    'date' => $item->date,
                    'amount' => (float)$item->amount
                ];
            });

        // Calculate previous period revenue
        $previousPeriodIncome = Billing::whereBetween('created_at', [$previousStart, $previousEnd])
            ->sum('amount') ?? 0;

        // Calculate totals
        $totalPatients = $wardStats->sum('patients');
        $totalRevenue = $incomeData->sum('amount');
        $averageDaily = $incomeData->count() > 0 ? $totalRevenue / $incomeData->count() : 0;
        $revenuePerPatient = $totalPatients > 0 ? $totalRevenue / $totalPatients : 0;

        // Find most profitable ward
        $mostProfitableWard = $wardStats
            ->sortByDesc(function ($stats) {
                return $stats['revenue'] ?? 0;
            })
            ->keys()
            ->first() ?? '';

        return response()->json([
            'status' => true,
            'data' => [
                'summary' => [
                    'totalAmount' => (float)$totalRevenue,
                    'averageDaily' => (float)$averageDaily,
                    'totalPatients' => (int)$totalPatients,
                    'revenuePerPatient' => (float)$revenuePerPatient,
                    'mostProfitableWard' => (string)$mostProfitableWard
                ],
                'wardDistribution' => $wardStats->toArray(),
                'incomeData' => $incomeData->toArray(),
                'patientCount' => $wardStats->map(fn($stats) => (int)$stats['patients'])->toArray(),
                'previousPeriodIncome' => (float)$previousPeriodIncome
            ]
        ]);

    } catch (\Exception $e) {
        \Log::error('Dashboard Stats Error: ' . $e->getMessage(), [
            'trace' => $e->getTraceAsString(),
            'time_range' => $timeRange ?? 'unknown',
            'request' => $request->all()
        ]);
        
        return response()->json([
            'status' => false,
            'message' => 'Failed to fetch dashboard statistics',
            'error' => config('app.debug') ? $e->getMessage() : 'Internal server error',
            'debug' => config('app.debug') ? [
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ] : null
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

    public function getPatientTransactions($patientId)
    {
        try {
            $transactions = Billing::whereHas('admission', function($query) use ($patientId) {
                $query->where('patient_id', $patientId);
            })
            ->with('admission')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function($billing) {
                return [
                    'id' => $billing->id,
                    'description' => $billing->description,
                    'amount' => $billing->amount,
                    'created_at' => $billing->created_at,
                    'admission_id' => $billing->admission_id
                ];
            });

            return response()->json([
                'status' => true,
                'data' => $transactions
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to fetch patient transactions: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch transactions'
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
            $patients = Patient::with(['activeAdmission']) // Ensure 'activeAdmission' is defined in your Patient model
                ->whereHas('activeAdmission')
                ->get()
                ->map(function ($patient) {
                    if (!$patient->activeAdmission) { // Should not happen due to whereHas, but good check
                        return null;
                    }
                    return [
                        'patient_id' => $patient->id,         // This is patients.id
                        'admission_id' => $patient->activeAdmission->id, // *** THIS IS CRUCIAL *** admissions.id
    
                        'first_name' => $patient->first_name,
                        'middle_name' => $patient->middle_name,
                        'last_name' => $patient->last_name,
                        'date_of_birth' => $patient->date_of_birth ? Carbon::parse($patient->date_of_birth)->format('Y-m-d') : null, // Consistent formatting
    
                        // Data from activeAdmission
                        'room_number' => $patient->activeAdmission->room_number,
                        'ward_type' => $patient->activeAdmission->ward_type,
                        'attending_physician' => $patient->activeAdmission->attending_physician,
                        'admission_date' => $patient->activeAdmission->created_at ? $patient->activeAdmission->created_at->format('Y-m-d') : null, // or admission_date field if you have one
                        'status' => $patient->activeAdmission->status, // This is the admission status
                        'remarks' => $patient->activeAdmission->remarks ?? ''
                    ];
                })->filter(); // Remove any nulls if a patient somehow had no active admission
    
            return response()->json([
                'status' => true,
                'data' => $patients
            ]);
    
        } catch (\Exception $e) {
            \Log::error('Failed to fetch active patients: ' . $e->getMessage() . ' at ' . $e->getFile() . ':' . $e->getLine());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch active patients',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error'
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

    public function downloadProgressBill(Request $request, $id)
    {
        try {
            $patient = Patient::with(['activeAdmission'])
                ->findOrFail($id);

            if (!$patient->activeAdmission) {
                throw new \Exception('No active admission found');
            }

            $amount = $request->query('amount', 0);
            if (!is_numeric($amount)) {
                throw new \Exception('Invalid amount specified');
            }

            $data = [
                'patient' => $patient,
                'admission' => $patient->activeAdmission,
                'amount' => floatval($amount),
                'date' => Carbon::now()->format('Y-m-d'),
                'room_number' => $patient->activeAdmission->room_number,
                'attending_physician' => $patient->activeAdmission->attending_physician,
                'ward_type' => $patient->activeAdmission->ward_type,
                'remarks' => $patient->activeAdmission->remarks ?? ''
            ];

            $pdf = PDF::loadView('billing.progress-bill', $data);
            
            return $pdf->stream("progress-bill-{$id}.pdf");

        } catch (\Exception $e) {
            \Log::error('Progress Bill Generation Error: ', [
                'patient_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Failed to generate progress bill: ' . $e->getMessage()
            ], 500);
        }
    }

    public function saveProgressBill(Request $request)
    {
        try {
            $validated = $request->validate([
                'patient_id' => 'required|exists:patients,id',
                'amount' => 'required|numeric|min:0'
            ]);

            $patient = Patient::with('activeAdmission')->findOrFail($validated['patient_id']);
            
            if (!$patient->activeAdmission) {
                throw new \Exception('No active admission found');
            }

            $billing = Billing::create([
                'admission_id' => $patient->activeAdmission->id,
                'description' => 'Progress Bill',
                'amount' => $validated['amount'],
                'total_amount' => $validated['amount']
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Progress bill saved successfully',
                'data' => $billing
            ]);

        } catch (\Exception $e) {
            \Log::error('Failed to save progress bill: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to save progress bill'
            ], 500);
        }
    }

    // Add this new method to handle PDF uploads
    public function uploadPdf(Request $request)
    {
        try {
            $request->validate([
                'pdf_file' => 'required|mimes:pdf|max:10240',
                'admission_id' => 'required|exists:admissions,id',
                'description' => 'required|string',
                'amount' => 'required|numeric|min:0'
            ]);

            $file = $request->file('pdf_file');
            $fileName = time() . '_SOA-' . $request->admission_id . '.pdf';
            
            // Ensure directory exists
            $directory = 'public/billing_pdfs';
            if (!Storage::exists($directory)) {
                Storage::makeDirectory($directory);
            }
            
            // Store the file
            $path = Storage::putFileAs(
                'public/billing_pdfs',
                $file,
                $fileName
            );

            // Create billing record with PDF
            $billing = Billing::create([
                'admission_id' => $request->admission_id,
                'description' => $request->description,
                'amount' => $request->amount,
                'total_amount' => $request->amount,
                'pdf_file' => $fileName,
                'pdf_path' => str_replace('public/', '', $path), // Remove 'public/' from path
                'pdf_original_name' => $file->getClientOriginalName()
            ]);

            return response()->json([
                'status' => true,
                'message' => 'PDF uploaded successfully',
                'data' => [
                    'billing' => $billing,
                    'pdf_url' => Storage::url($path)
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('PDF upload failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to upload PDF: ' . $e->getMessage()
            ], 500);
        }
    }

    // Add method to get PDFs for a patient
    public function getPatientPdfs($patientId)
    {
        try {
            $pdfs = Billing::whereHas('admission', function($query) use ($patientId) {
                $query->where('patient_id', $patientId);
            })
            ->whereNotNull('pdf_file')
            ->orderBy('created_at', 'desc')
            ->get();

            return response()->json([
                'status' => true,
                'data' => $pdfs
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch PDFs'
            ], 500);
        }
    }

    public function showPdf(Billing $billing)
    {
        if (!$billing->pdf_path || !Storage::disk('public')->exists($billing->pdf_path)) {
            abort(404);
        }
        
        $path = storage_path('app/public/' . $billing->pdf_path);
        return response()->file($path);
    }

    public function showPublic($id)
    {
        try {
            $admission = Admission::with(['patient', 'billings'])->findOrFail($id);
            
            $billings = $admission->billings()
                ->orderBy('created_at', 'desc')
                ->get();

            $total = $billings->sum('amount');

            $data = [
                'admission' => $admission,
                'patient' => $admission->patient,
                'billings' => $billings,
                'total' => $total
            ];

            return view('portal.show', $data);
        } catch (\Exception $e) {
            \Log::error('Error in showPublic: ' . $e->getMessage());
            abort(404);
        }
    }
}