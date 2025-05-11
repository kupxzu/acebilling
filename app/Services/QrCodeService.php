<?php

namespace App\Services;

use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\Storage;

class QrCodeService
{
    public function generateEncryptedUrl($patientId)
    {
        return url('/p/' . $this->generateSecureHash($patientId));
    }

    public function generateSecureHash($patientId)
    {
        $timestamp = now()->timestamp;
        $random = Str::random(16);
        return base64_encode("{$patientId}:{$timestamp}:{$random}");
    }

    public function decodeHash($hash)
    {
        try {
            $decoded = base64_decode($hash);
            list($patientId, $timestamp, $random) = explode(':', $decoded);
            
            // Check if hash is not older than 30 days (for better user experience)
            if (now()->timestamp - $timestamp > 2592000) {
                throw new \Exception('Portal link has expired');
            }
            
            return (int) $patientId;
        } catch (\Exception $e) {
            \Log::error('Invalid portal hash: ' . $e->getMessage());
            throw new \Exception('Invalid portal access link');
        }
    }

    public function generatePatientQr($patientId)
    {
        // Generate a unique hash for the patient portal URL
        $hash = $this->generateSecureHash($patientId);
        
        // Generate QR code image
        $qrCode = QrCode::format('png')
            ->size(300)
            ->errorCorrection('H')
            ->generate(route('patient.portal', ['hash' => $hash]));
            
        // Save QR code image
        $filename = "patient-{$patientId}-" . time() . '.png';
        Storage::disk('public')->put("qrcodes/{$filename}", $qrCode);
        
        return [
            'status' => true,
            'qrCodeUrl' => Storage::url("qrcodes/{$filename}"),
            'portalUrl' => route('patient.portal', ['hash' => $hash]),
            'hash' => $hash
        ];
    }
}