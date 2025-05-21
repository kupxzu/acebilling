<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\PatientPortalController;
use App\Http\Controllers\BillingController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return view('welcome');
});

// Protected routes that require authentication
Route::middleware(['auth', 'role:admitting'])->group(function () {
    Route::post('/patients', [PatientController::class, 'store']);
    Route::get('/patients/{patient}/qr', [PatientController::class, 'generateQR']);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/patients', [PatientController::class, 'index']);
});

// Patient Portal Route - This is a public route
Route::get('/p/{hash}', [PatientPortalController::class, 'show'])->name('patient.portal');
Route::get('/billing/soa/{id}/download', [BillingController::class, 'downloadSOA'])->name('billing.soa.download');
Route::get('/billing/progress/{id}/download', [BillingController::class, 'downloadProgressBill'])->name('billing.progress.download');
Route::get('/patients/{patient}', [PatientController::class, 'show'])->name('patients.show');
Route::get('/billing/pdf/{billing}', [BillingController::class, 'showPdf'])
    ->name('billing.pdf.show');

// Add other routes as needed for your application