<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class PatientController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
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
            
            // Ensure directory exists
            if (!Storage::disk('public')->exists($folderPath)) {
                Storage::disk('public')->makeDirectory($folderPath);
            }

            // Generate QR code
            $qrCode = QrCode::format('png')
                            ->size(300)
                            ->errorCorrection('H')
                            ->margin(1)
                            ->generate(url("/patients/{$patient->id}"));

            // Store using Laravel's Storage facade
            Storage::disk('public')->put($folderPath . '/' . $fileName, $qrCode);

            // Return the URL to the QR code
            return response()->json([
                'status' => true,
                'qrCodeUrl' => Storage::disk('public')->url($folderPath . '/' . $fileName)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to generate QR code'
            ], 500);
        }
    }

    public function admit(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
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
                'name' => $validated['name'],
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
                    'status' => $patient->admissions->first()?->status
                ]
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch patient', [
                'error' => $e->getMessage(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch patient details'
            ], 404);
        }
    }

    public function update($id, Request $request)
    {
        try {
            $patient = Patient::findOrFail($id);
            
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'room_number' => 'required|string|max:50',
                'ward_type' => ['required', Rule::in(Patient::$wardTypes)],
                'attending_physician' => 'required|string|max:255',
                'remarks' => 'nullable|string|max:1000'
            ]);

            $patient->fill($validated);
            
            if (!$patient->save()) {
                throw new \Exception('Failed to save patient data');
            }

            return response()->json([
                'status' => true,
                'message' => 'Patient updated successfully',
                'data' => $patient->fresh()
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Patient not found'
            ], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Failed to update patient', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Failed to update patient: ' . $e->getMessage()
            ], 500);
        }
    }
}
