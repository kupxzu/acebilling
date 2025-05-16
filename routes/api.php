<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\DashboardController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// --- PUBLIC ROUTES ---
Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);

// Password Reset
Route::post('/forgot-password', [UserController::class, 'forgotPassword']);
Route::post('/reset-password', [UserController::class, 'resetPassword']);

// Public Patient Portal Access
Route::get('/portal/patient/{hash}', [PatientController::class, 'getPortalData']);
Route::get('/p/{hash}', [PatientController::class, 'showPortal'])->name('patient.portal');

// Debug API health check
Route::get('/health', function() {
    return response()->json([
        'status' => 'ok',
        'message' => 'API is working',
        'timestamp' => now()->toISOString(),
        'environment' => config('app.env')
    ]);
});

// --- PROTECTED ROUTES ---
Route::middleware(['auth:sanctum'])->group(function () {
    // User Management
    Route::post('/logout', [UserController::class, 'logout']);
    Route::get('/profile', [UserController::class, 'profile']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // Patient Management
    Route::prefix('patients')->group(function () {
        Route::get('/', [PatientController::class, 'index']);
        Route::post('/', [PatientController::class, 'store']);
        Route::post('/admit', [PatientController::class, 'admit']);
        Route::get('/{id}', [PatientController::class, 'show']);
        Route::get('/{id}/details', [PatientController::class, 'details']);
        Route::put('/{id}', [PatientController::class, 'update']);
        Route::post('/check-exists', [PatientController::class, 'checkExists']);

        // QR Code and Portal Access
        Route::get('/{id}/qr', [PatientController::class, 'getQR']);
        Route::post('/{patient}/generate-qr', [PatientController::class, 'generateQR']);
        Route::get('/{id}/portal-access', [PatientController::class, 'getPortalAccess']);
        Route::post('/{id}/generate-portal-access', [PatientController::class, 'generatePortalAccess']);
    });

    // Billing Management
    Route::prefix('billing')->group(function () {
        // Billing Dashboard
        Route::get('/dashboard', [BillingController::class, 'dashboard']);
        Route::get('/dashboard-stats', [BillingController::class, 'getDashboardStats']);

        // Patient Lists for Billing
        Route::get('/patients', [BillingController::class, 'getPatients']);
        Route::get('/active-patients', [BillingController::class, 'getActivePatients']);

        // SOA and Progress Bills
        Route::get('/soa/{id}', [BillingController::class, 'getSOA']);
        Route::get('/soa/{id}/download', [BillingController::class, 'downloadSOA']);
        Route::get('/progress/{id}', [BillingController::class, 'getProgressBill']);
        Route::get('/progress/{id}/download', [BillingController::class, 'downloadProgressBill']);
        Route::post('/progress/save', [BillingController::class, 'saveProgressBill']);

        // Charges
        Route::post('/charges/{id}', [BillingController::class, 'addCharge']);
        Route::patch('/charges/{id}/status', [BillingController::class, 'updateChargeStatus']);
        Route::get('/patient-charges/{patientId}', [BillingController::class, 'getPatientCharges']);

        // Transactions
        Route::get('/transactions/{patientId}', [BillingController::class, 'getPatientTransactions']);

        // PDF Upload and Retrieval
        Route::post('/upload-pdf', [BillingController::class, 'uploadPdf']);
        Route::get('/patient-pdfs/{patientId}', [BillingController::class, 'getPatientPdfs']);

        // Reports
        Route::get('/reports', [BillingController::class, 'getReports']);
    });
});