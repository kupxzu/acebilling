<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Models\User;

class TestController extends Controller
{
    public function testMail()
    {
        try {
            Mail::raw('This is a test email', function ($message) {
                $message->to('test@example.com')
                        ->subject('Test Email from Laravel');
            });
            
            return response()->json([
                'status' => true,
                'message' => 'Test email sent successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to send email',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    public function checkPasswordResetTable()
    {
        try {
            $tokens = DB::table('password_resets')->get();
            
            return response()->json([
                'status' => true,
                'tokens' => $tokens,
                'count' => $tokens->count()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'Failed to access password_resets table',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    public function testForgotPasswordFlow(Request $request)
    {
        $email = $request->input('email', 'test@example.com');
        
        $steps = [];
        
        // Step 1: Check if email exists
        $user = User::where('email', $email)->first();
        $steps[] = [
            'step' => 'Check if user exists',
            'status' => $user ? 'success' : 'failed',
            'data' => $user ? 'User found' : 'User not found'
        ];
        
        if (!$user) {
            return response()->json([
                'status' => false,
                'steps' => $steps,
                'message' => 'User not found'
            ]);
        }
        
        // Step 2: Check mail configuration
        $mailConfig = [
            'driver' => config('mail.default'),
            'host' => config('mail.mailers.smtp.host'),
            'port' => config('mail.mailers.smtp.port'),
            'from' => config('mail.from.address')
        ];
        
        $steps[] = [
            'step' => 'Check mail configuration',
            'status' => 'info',
            'data' => $mailConfig
        ];
        
        // Step 3: Check frontend URL
        $frontendUrl = config('app.frontend_url');
        $steps[] = [
            'step' => 'Check frontend URL',
            'status' => $frontendUrl ? 'success' : 'failed',
            'data' => $frontendUrl ?: 'Not configured'
        ];
        
        // Step 4: Check if password_resets table exists
        try {
            DB::table('password_resets')->count();
            $steps[] = [
                'step' => 'Check password_resets table',
                'status' => 'success',
                'data' => 'Table exists'
            ];
        } catch (\Exception $e) {
            $steps[] = [
                'step' => 'Check password_resets table',
                'status' => 'failed',
                'data' => $e->getMessage()
            ];
        }
        
        return response()->json([
            'status' => true,
            'steps' => $steps,
            'summary' => 'Diagnostic complete'
        ]);
    }
}