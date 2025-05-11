<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\PatientPortal;
use Illuminate\Http\Request;

class PatientPortalController extends Controller
{
    public function show($hash)
    {
        try {
            // Find the portal access by hash
            $portal = PatientPortal::where('access_hash', $hash)
                                   ->where(function($query) {
                                       $query->whereNull('expires_at')
                                             ->orWhere('expires_at', '>', now());
                                   })
                                   ->firstOrFail();
            
            // Get the patient
            $patient = Patient::with(['admissions' => function($query) {
                $query->latest()->with('billings');
            }])->findOrFail($portal->patient_id);
            
            $currentAdmission = $patient->admissions->first();
            
            if (!$currentAdmission) {
                return view('portal.error', ['message' => 'No active admission found']);
            }
            
            // Get all billing records for this admission
            $billings = $currentAdmission->billings;
            
            // Calculate totals
            $total = $billings->sum('amount');
            $pendingTotal = $billings->where('status', 'pending')->sum('amount');
            $paidTotal = $billings->where('status', 'paid')->sum('amount');
            
            // Group charges by category for the progress bill
            $chargesByCategory = $billings->groupBy('category');
            
            return view('portal.show', [
                'patient' => $patient,
                'admission' => $currentAdmission,
                'billings' => $billings,
                'chargesByCategory' => $chargesByCategory,
                'total' => $total,
                'pendingTotal' => $pendingTotal,
                'paidTotal' => $paidTotal
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Portal access error: ' . $e->getMessage());
            return view('portal.error', ['message' => 'Invalid or expired portal link']);
        }
    }
}