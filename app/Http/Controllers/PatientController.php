<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use App\Services\QrCodeService;
use App\Models\PatientPortal;
use App\Models\PortalAccess;

class PatientController extends Controller
{
    protected $qrCodeService;

    public function __construct(QrCodeService $qrCodeService)
    {
        $this->qrCodeService = $qrCodeService;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'middle_name' => 'nullable|string|max:100',
            'name_initial' => 'nullable|string|max:10',
            'date_of_birth' => 'required|date|before:today',
            'room_number' => 'required|string|max:50',
            'ward_type' => 'required|in:private,semi-private,ward',
            'attending_physician' => 'required|string|max:255'
        ]);

        $patient = Patient::create($validated);

        return response()->json($patient, 201);
    }

    public function generateQR(Patient $patient)
    {
        try {
            $fileName = 'patient-' . $patient->id . '-' . time() . '.png';
            $folderPath = 'qrcodes';
            
            if (!Storage::disk('public')->exists($folderPath)) {
                Storage::disk('public')->makeDirectory($folderPath);
            }

            // Generate encrypted URL
            $encryptedUrl = $this->qrCodeService->generateEncryptedUrl($patient->id);
            
            // Generate QR code with encrypted URL
            $qrCode = QrCode::format('png')
                           ->size(300)
                           ->errorCorrection('H')
                           ->margin(1)
                           ->generate($encryptedUrl);

            Storage::disk('public')->put($folderPath . '/' . $fileName, $qrCode);

            return response()->json([
                'status' => true,
                'qrCodeUrl' => Storage::disk('public')->url($folderPath . '/' . $fileName)
            ]);
        } catch (\Exception $e) {
            \Log::error('QR Code generation failed', [
                'patient_id' => $patient->id,
                'error' => $e->getMessage()
            ]);
            return response()->json([
                'status' => false,
                'message' => 'Failed to generate QR code'
            ], 500);
        }
    }

    public function getQR($id)
    {
        try {
            $patient = Patient::findOrFail($id);
            // Look for the most recent QR code for this patient
            $qrCodePath = 'qrcodes/patient-' . $patient->id . '-*.png';
            $files = Storage::disk('public')->files('qrcodes');
            
            // Filter files to find the matching QR code
            $matchingFiles = array_filter($files, function($file) use ($patient) {
                return str_starts_with($file, 'qrcodes/patient-' . $patient->id . '-');
            });
            
            if (empty($matchingFiles)) {
                return response()->json([
                    'status' => false,
                    'message' => 'QR code not found'
                ], 404);
            }

            // Get the most recent QR code (last created)
            $latestQrCode = end($matchingFiles);

            return response()->json([
                'status' => true,
                'qrCodeUrl' => Storage::disk('public')->url($latestQrCode)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Error retrieving QR code: ' . $e->getMessage()
            ], 500);
        }
    }

public function admit(Request $request)
{
    $validated = $request->validate([
        'first_name' => 'required|string|max:100',
        'last_name' => 'required|string|max:100',
        'middle_name' => 'nullable|string|max:100',
        'name_initial' => 'nullable|string|max:10',
        'date_of_birth' => 'required|date|before:today',
        'room_number' => 'required|string|max:50',
        'ward_type' => 'required|in:private,semi-private,ward',
        'attending_physician' => 'required|string|max:255',
        'admission_date' => 'required|date',
        'remarks' => 'nullable|string'
    ]);

    DB::beginTransaction();
    try {
        // Create patient record
        $patient = Patient::create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'middle_name' => $validated['middle_name'],
            'name_initial' => $validated['name_initial'],
            'date_of_birth' => $validated['date_of_birth'],
            'room_number' => $validated['room_number'],
            'ward_type' => $validated['ward_type'],
            'attending_physician' => $validated['attending_physician']
        ]);

        // Create admission record
        $patient->admissions()->create([
            'admission_date' => $validated['admission_date'],
            'room_number' => $validated['room_number'],
            'ward_type' => $validated['ward_type'],
            'attending_physician' => $validated['attending_physician'],
            'remarks' => $validated['remarks'] ?? null,
            'status' => 'active'
        ]);

        DB::commit();

        return response()->json([
            'status' => true,
            'message' => 'Patient admitted successfully',
            'id' => $patient->id
        ], 201);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'status' => false,
            'message' => 'Failed to admit patient: ' . $e->getMessage()
        ], 500);
    }
}

    public function index()
    {
        try {
            $patients = Patient::with(['admissions' => function ($query) {
                $query->latest();
            }])
            ->latest()
            ->paginate(9); // Show 9 patients per page (3x3 grid)

            return response()->json([
                'status' => true,
                'data' => $patients
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch patients', [
                'error' => $e->getMessage(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch patients'
            ], 500);
        }
    }

    public function details($id)
    {
        try {
            $patient = Patient::with(['admissions' => function($query) {
                $query->latest();
            }])->findOrFail($id);

            return response()->json([
                'status' => true,
                'data' => [
                    'id' => $patient->id,
                    'name' => $patient->name,
                    'room_number' => $patient->room_number,
                    'ward_type' => $patient->ward_type,
                    'attending_physician' => $patient->attending_physician,
                    'remarks' => $patient->remarks,
                    'admission_date' => $patient->admissions->first()?->created_at,
                    'status' => $patient->admissions->first()?->status,
                    'created_at' => $patient->created_at,
                    'updated_at' => $patient->updated_at
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch patient details'
            ], 404);
        }
    }

    public function show($id)
    {
        try {
            $patient = Patient::findOrFail($id);

            return response()->json([
                'status' => true,
                'data' => [
                    'id' => $patient->id,
                    'first_name' => $patient->first_name,
                    'last_name' => $patient->last_name,
                    'middle_name' => $patient->middle_name,
                    'name_initial' => $patient->name_initial,
                    'date_of_birth' => $patient->date_of_birth,
                    'room_number' => $patient->room_number,
                    'ward_type' => $patient->ward_type,
                    'attending_physician' => $patient->attending_physician,
                    'remarks' => $patient->remarks
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch patient details'
            ], 404);
        }
    }

    public function showPublic($encryptedData)
    {
        try {
            $patientId = $this->qrCodeService->decryptUrl($encryptedData);
            $patient = Patient::findOrFail($patientId);

            return view('patients.show', compact('patient'));
        } catch (\Exception $e) {
            \Log::error('Invalid QR code access attempt', [
                'encrypted_data' => $encryptedData,
                'error' => $e->getMessage()
            ]);
            abort(404, 'Invalid or expired QR code');
        }
    }

    public function update($id, Request $request)
    {
        try {
            $patient = Patient::findOrFail($id);
            
            $validated = $request->validate([
                'first_name' => 'required|string|max:100',
                'last_name' => 'required|string|max:100',
                'middle_name' => 'nullable|string|max:100',
                'name_initial' => 'nullable|string|max:10',
                'date_of_birth' => 'required|date|before:today',
                'room_number' => 'required|string|max:50',
                'ward_type' => 'required|in:private,semi-private,ward',
                'attending_physician' => 'required|string|max:255',
                'remarks' => 'nullable|string'
            ]);

            $patient->update($validated);

            return response()->json([
                'status' => true,
                'message' => 'Patient updated successfully',
                'data' => $patient->fresh()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to update patient: ' . $e->getMessage()
            ], 500);
        }
    }

    protected function decodeHash($hash)
{
    try {
        $decoded = base64_decode($hash);
        list($patientId, $timestamp, $random) = explode(':', $decoded);
        return (int) $patientId;
    } catch (\Exception $e) {
        throw new \Exception('Invalid portal access link');
    }
}
public function getPortalData($hash)
{
    try {
        // Log for debugging
        \Log::info('Accessing portal data with hash: ' . $hash);
        
        // Decode the hash to get the patient ID
        $patientId = $this->decodeHash($hash);
        
        $patient = Patient::with(['admissions' => function ($query) {
            $query->latest();
        }])->findOrFail($patientId);

        $currentAdmission = $patient->admissions->first();
        
        if (!$currentAdmission) {
            throw new \Exception('No active admission found');
        }

        // Get billing data
        $charges = $currentAdmission->billings()->orderBy('created_at')->get();
        
        // Format data for progress bill
        $progressBill = $charges->map(function ($billing) {
            return [
                'date' => $billing->created_at,
                'category' => $billing->category,
                'description' => $billing->description,
                'amount' => $billing->amount
            ];
        });

        // Format data for SOA
        $soa = $charges->map(function ($billing) {
            return [
                'date' => $billing->created_at,
                'description' => $billing->description,
                'amount' => $billing->amount,
                'status' => $billing->status
            ];
        });

        return response()->json([
            'patient' => [
                'name' => $patient->name,
                'room_number' => $patient->room_number,
                'ward_type' => $patient->ward_type,
                'attending_physician' => $patient->attending_physician,
                'admission_date' => $currentAdmission->admission_date ?? $currentAdmission->created_at
            ],
            'progressBill' => [
                'charges' => $progressBill,
                'total' => $progressBill->sum('amount')
            ],
            'soa' => [
                'charges' => $soa,
                'total' => $soa->where('status', '!=', 'paid')->sum('amount')
            ]
        ]);

    } catch (\Exception $e) {
        \Log::error('Portal data error: ' . $e->getMessage());
        return response()->json([
            'error' => $e->getMessage()
        ], 404);
    }
}

    public function getQrCode($id)
    {
        try {
            $patient = Patient::findOrFail($id);
            return response()->json($this->qrCodeService->generatePatientQr($patient->id));
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to generate QR code'], 500);
        }
    }

public function getPortalAccess($id)
{
    try {
        $patient = Patient::findOrFail($id);
        
        // Try to find existing portal access
        $portal = PatientPortal::where('patient_id', $patient->id)
                                ->first();
        
        // If no portal access exists, create one
        if (!$portal) {
            return $this->generatePortalAccess($id);
        }
        
        // Create the portal URL
        $portalUrl = url('/p/' . $portal->access_hash);
        
        // Try to find the QR code image
        $qrImagePath = null;
        try {
            $files = Storage::disk('public')->files('qrcodes');
            
            // Filter files to find the matching QR code
            $matchingFiles = array_filter($files, function($file) use ($patient) {
                return str_starts_with($file, 'qrcodes/patient-' . $patient->id . '-');
            });
            
            if (!empty($matchingFiles)) {
                // Get the most recent QR code (last created)
                $latestQrCode = end($matchingFiles);
                $qrImagePath = Storage::disk('public')->url($latestQrCode);
            } else {
                // Generate a new QR code if none exists
                $fileName = 'patient-' . $patient->id . '-' . time() . '.png';
                $qrCode = QrCode::format('png')
                    ->size(300)
                    ->errorCorrection('H')
                    ->margin(1)
                    ->generate($portalUrl);
                    
                Storage::disk('public')->put('qrcodes/' . $fileName, $qrCode);
                $qrImagePath = Storage::disk('public')->url('qrcodes/' . $fileName);
            }
        } catch (\Exception $e) {
            \Log::warning('QR code image retrieval/generation failed: ' . $e->getMessage());
            // Continue anyway, we can still use the portal URL
        }

        return response()->json([
            'status' => true,
            'qrCodeUrl' => $qrImagePath ?: $portalUrl, // Use portal URL as fallback if image not available
            'portalUrl' => $portalUrl,
            'hash' => $portal->access_hash
        ]);
    } catch (\Exception $e) {
        \Log::error('Failed to fetch portal access: ' . $e->getMessage());
        return response()->json([
            'status' => false,
            'message' => 'Failed to fetch portal access: ' . $e->getMessage()
        ], 500);
    }
}
    public function generatePortalAccess($id)
    {
        try {
            $patient = Patient::findOrFail($id);
            
            // Generate a new hash regardless of whether one already exists
            $hash = $this->generateHash($patient->id);
            $portalUrl = route('patient.portal', ['hash' => $hash]);
            
            // Update or create the portal access record
            PatientPortal::updateOrCreate(
                ['patient_id' => $patient->id],
                [
                    'access_hash' => $hash,
                    'expires_at' => now()->addDays(30),  // Optional: Set an expiration
                ]
            );

            return response()->json([
                'status' => true,
                'qrCode' => $portalUrl,
                'portalUrl' => $portalUrl,
                'hash' => $hash
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to generate portal access: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to generate portal access'
            ], 500);
        }
    }

    protected function generateHash($patientId)
    {
        $timestamp = now()->timestamp;
        $random = Str::random(16);
        return base64_encode("{$patientId}:{$timestamp}:{$random}");
    }
    public function showPortal($hash)
    {
        try {
            $decoded = base64_decode($hash);
            list($patientId, $timestamp) = explode(':', $decoded);
            
            $patient = Patient::with(['admissions' => function ($query) {
                $query->latest()->with(['charges', 'billings']);
            }])->findOrFail($patientId);

            return response()->json([
                'status' => true,
                'patient' => [
                    'name' => $patient->name,
                    'room_number' => $patient->room_number,
                    'ward_type' => $patient->ward_type,
                    'attending_physician' => $patient->attending_physician,
                    'admission_date' => $patient->admissions->first()->created_at,
                ],
                'admission' => $patient->admissions->first(),
                'charges' => $patient->admissions->first()->charges,
                'billings' => $patient->admissions->first()->billings
            ]);
        } catch (\Exception $e) {
            \Log::error('Invalid portal access: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Invalid portal access: ' . $e->getMessage()
            ], 404);
        }
    }
}
