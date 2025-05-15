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


// --- PROTECTED ROUTES ---
Route::middleware(['auth:sanctum', 'check.token.expiration'])->group(function () {

    // User Management
    Route::post('/logout', [UserController::class, 'logout']);
    Route::get('/profile', [UserController::class, 'profile']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Dashboard
    // Note: Moved '/dashboard/stats' here as it likely requires authentication.
    // If it's truly public, move it outside this auth group.
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

        // QR Code and Portal Access (Patient Specific)
        Route::get('/{id}/qr', [PatientController::class, 'getQR']);
        Route::post('/{patient}/generate-qr', [PatientController::class, 'generateQR']); // Note: {patient} implies ID
        Route::get('/{id}/portal-access', [PatientController::class, 'getPortalAccess']);
        Route::post('/{id}/generate-portal-access', [PatientController::class, 'generatePortalAccess']);
    });

    // Billing Management
    Route::prefix('billing')->group(function () {
        // Billing Dashboard
        Route::get('/dashboard', [BillingController::class, 'dashboard']); // Main billing dashboard data
        Route::get('/dashboard-stats', [BillingController::class, 'getDashboardStats']); // Specific stats for billing dashboard

        // Patient Lists for Billing Context
        Route::get('/patients', [BillingController::class, 'getPatients']); // Paginated list of patients with bill summaries
        Route::get('/active-patients', [BillingController::class, 'getActivePatients']); // List of active patients for selection

        // Statement of Account (SOA) and Progress Bills
        Route::get('/soa/{id}', [BillingController::class, 'getSOA']); // {id} is likely admission_id
        Route::get('/soa/{id}/download', [BillingController::class, 'downloadSOA']);
        Route::get('/progress/{id}', [BillingController::class, 'getProgressBill']); // {id} is likely admission_id
        Route::get('/progress/{id}/download', [BillingController::class, 'downloadProgressBill']); // {id} is patient_id for this one based on controller
        Route::post('/progress/save', [BillingController::class, 'saveProgressBill']);

        // Charges
        Route::post('/charges/{id}', [BillingController::class, 'addCharge']); // {id} is likely admission_id
        Route::patch('/charges/{id}/status', [BillingController::class, 'updateChargeStatus']); // {id} is billing_id (charge_id)
        // Removed redundant POST for '/charges/{id}/status'
        Route::get('/patient-charges/{patientId}', [BillingController::class, 'getPatientCharges']);

        // Transactions / Billing History
        Route::get('/transactions/{patientId}', [BillingController::class, 'getPatientTransactions']);

        // PDF Upload and Retrieval
        Route::post('/upload-pdf', [BillingController::class, 'uploadPdf']);
        Route::get('/patient-pdfs/{patientId}', [BillingController::class, 'getPatientPdfs']);

        // Reports
        Route::get('/reports', [BillingController::class, 'getReports']);
    });
});

// Note: The route GET /billing/patients/{id}/details from the second auth group was removed.
// The existing GET /patients/{id}/details (PatientController@details) is assumed to be the correct one
// for fetching general patient details.
// If BillingController needs a specific patient detail view, a new method and route should be defined.

