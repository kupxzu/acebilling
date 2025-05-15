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

    public function getDashboardStats()
    {
        try {
            // Get ward distribution
            $wardDistribution = Admission::where('status', 'active')
                ->selectRaw('ward_type, COUNT(*) as count')
                ->groupBy('ward_type')
                ->get()
                ->mapWithKeys(function ($item) {
                    $key = str_replace('-', '', lcfirst(ucwords($item->ward_type, '-')));
                    return [$key => $item->count];
                })
                ->toArray();

            // Get total amount from billings
            $totalAmount = Billing::sum('total_amount');

            return response()->json([
                'status' => true,
                'data' => [
                    'totalAmount' => $totalAmount,
                    'wardDistribution' => [
                        'private' => $wardDistribution['private'] ?? 0,
                        'semiPrivate' => $wardDistribution['semiPrivate'] ?? 0,
                        'ward' => $wardDistribution['ward'] ?? 0
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Dashboard Stats Error: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch dashboard statistics',
                'error' => config('app.debug') ? $e->getMessage() : null
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
                'pdf_file' => 'required|mimes:pdf|max:10240', // max 10MB
                'admission_id' => 'required|exists:admissions,id',
                'description' => 'required|string',
                'amount' => 'required|numeric|min:0'
            ]);

            $file = $request->file('pdf_file');
            $fileName = time() . '_' . $file->getClientOriginalName();
            
            // Store the file
            $path = $file->storeAs('billing_pdfs', $fileName, 'public');

            // Create billing record with PDF
            $billing = Billing::create([
                'admission_id' => $request->admission_id,
                'description' => $request->description,
                'amount' => $request->amount,
                'total_amount' => $request->amount,
                'pdf_file' => $fileName,
                'pdf_path' => $path,
                'pdf_original_name' => $file->getClientOriginalName()
            ]);

            return response()->json([
                'status' => true,
                'message' => 'PDF uploaded successfully',
                'data' => $billing
            ]);

        } catch (\Exception $e) {
            \Log::error('PDF upload failed: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to upload PDF'
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

    public function showPdf($id)
    {
        try {
            // Get billing with relationships
            $billing = Billing::with(['admission.patient'])->findOrFail($id);

            if (!$billing->admission) {
                throw new \Exception('No admission record found for this billing');
            }

            // Check if PDF exists
            if (!Storage::exists($billing->pdf_path)) {
                throw new \Exception('PDF file not found');
            }

            // Format the data
            $data = [
                'billing' => $billing,
                'patient' => $billing->admission->patient,
                'admission' => $billing->admission,
                'billDate' => $billing->created_at ? $billing->created_at->format('M d, Y') : 'N/A'
            ];

            return view('portal.show-pdf', $data);

        } catch (\Exception $e) {
            \Log::error('Error showing PDF: ' . $e->getMessage());
            return back()->with('error', 'Unable to display billing information');
        }
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