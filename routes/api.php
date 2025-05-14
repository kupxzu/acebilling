<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\BillingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TestController;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);
Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

// Password reset routes (public)
Route::post('/forgot-password', [UserController::class, 'forgotPassword']);
Route::post('/reset-password', [UserController::class, 'resetPassword']);

// // Test routes for debugging (remove in production)
// Route::get('/test-mail', [TestController::class, 'testMail']);
// Route::get('/test-password-reset-table', [TestController::class, 'checkPasswordResetTable']);
// Route::get('/test-forgot-password-flow', [TestController::class, 'testForgotPasswordFlow']);
// Route::get('/test-simple-mail', function () {
//     try {
//         Mail::raw('This is a test email', function ($message) {
//             $message->to('test@example.com')
//                     ->subject('Test Email');
//         });
        
//         return response()->json([
//             'status' => true,
//             'message' => 'Email sent',
//             'driver' => config('mail.default'),
//             'log_location' => storage_path('logs/laravel.log')
//         ]);
//     } catch (\Exception $e) {
//         return response()->json([
//             'status' => false,
//             'error' => $e->getMessage()
//         ]);
//     }
// });

// Important: These public portal routes must be accessible without authentication
Route::get('/portal/patient/{hash}', [PatientController::class, 'getPortalData']);
Route::get('/p/{hash}', [PatientController::class, 'showPortal'])->name('patient.portal');

// Protected routes
Route::middleware(['auth:sanctum', 'check.token.expiration'])->group(function () {
    // User routes
    Route::post('/logout', [UserController::class, 'logout']);
    Route::get('/profile', [UserController::class, 'profile']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Patient routes
    Route::get('/patients', [PatientController::class, 'index']);
    Route::post('/patients', [PatientController::class, 'store']);
    Route::post('/patients/admit', [PatientController::class, 'admit']);
    Route::get('/patients/{id}', [PatientController::class, 'show']);
    Route::get('/patients/{id}/details', [PatientController::class, 'details']);
    Route::put('/patients/{id}', [PatientController::class, 'update']);
    
    // QR code and portal access routes
    Route::get('/patients/{id}/qr', [PatientController::class, 'getQR']);
    Route::post('/patients/{patient}/generate-qr', [PatientController::class, 'generateQR']);
    Route::get('/patients/{id}/portal-access', [PatientController::class, 'getPortalAccess']);
    Route::post('/patients/{id}/generate-portal-access', [PatientController::class, 'generatePortalAccess']);

    // Billing routes
    Route::prefix('billing')->group(function () {
        // Dashboard
        Route::get('/dashboard', [BillingController::class, 'dashboard']);
        Route::get('/dashboard-stats', [BillingController::class, 'getDashboardStats']);
        
        // Patient listing
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
        Route::post('/charges/{id}/status', [BillingController::class, 'updateChargeStatus']);
        Route::get('/patient-charges/{patientId}', [BillingController::class, 'getPatientCharges']);
        
        // Reports
        Route::get('/reports', [BillingController::class, 'getReports']);
        
        // Transactions
        Route::get('/transactions/{patientId}', [BillingController::class, 'getPatientTransactions']);
    });
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::prefix('billing')->group(function () {
        Route::get('/active-patients', [BillingController::class, 'getActivePatients']);
        Route::get('/patients/{id}/details', [BillingController::class, 'getPatientDetails']);
        Route::get('/progress/{id}/download', [BillingController::class, 'downloadProgressBill']);
        Route::post('/progress/save', [BillingController::class, 'saveProgressBill']);
    });
});