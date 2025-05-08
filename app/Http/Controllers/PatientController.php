<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
        $url = url("/patient/{$patient->id}");
        $qrCode = QrCode::format('png')
                       ->size(300)
                       ->generate($url);

        $qrPath = "qrcodes/patient-{$patient->id}.png";
        \Storage::put("public/{$qrPath}", $qrCode);

        return response()->json([
            'qr_code' => \Storage::url($qrPath)
        ]);
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
}
