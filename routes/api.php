<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\BillingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [UserController::class, 'logout']);
    Route::get('/profile', [UserController::class, 'profile']);
});

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware(['auth:sanctum'])->group(function () {
    // Patient routes
    Route::get('/patients', [PatientController::class, 'index']);
    Route::post('/patients', [PatientController::class, 'store']);
    Route::get('/patients/{id}/details', [PatientController::class, 'details']);
    Route::get('/patients/{id}', [PatientController::class, 'show']);
    Route::post('/patients/{patient}/generate-qr', [PatientController::class, 'generateQR']);
    Route::post('/patients/admit', [PatientController::class, 'admit']);
    Route::put('/patients/{id}', [PatientController::class, 'update']);

    // Dashboard routes
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // Billing routes
    Route::prefix('billing')->group(function () {
        Route::get('/active-patients', [BillingController::class, 'getActivePatients']);
        Route::get('/soa/{id}', [BillingController::class, 'getSOA']);
        Route::get('/soa/{id}/download', [BillingController::class, 'downloadSOA']);
        Route::get('/progress/{id}', [BillingController::class, 'getProgressBill']);
        Route::post('/charges/{id}', [BillingController::class, 'addCharge']);
        Route::get('/patients', [BillingController::class, 'getPatients']);
        Route::get('/reports', [BillingController::class, 'getReports']);
        Route::match(['post', 'patch'], '/charges/{id}/status', [BillingController::class, 'updateChargeStatus']);
        Route::get('/patient-charges/{id}', [BillingController::class, 'getPatientCharges']);
        Route::get('/dashboard-stats', [BillingController::class, 'getDashboardStats']);
    });
});
