<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;
use App\Mail\ResetPasswordMail;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8',
                'role' => 'required|in:admin,billing,admitting'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation Error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'status' => true,
                'message' => 'User registered successfully',
                'data' => $user,
                'token' => $token
            ], 201);

        } catch (\Exception $e) {
            Log::error('Registration failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'status' => false,
                'message' => 'Registration failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * User login - API token based without CSRF requirements
     */
    public function login(Request $request)
    {
        Log::debug('Login attempt', [
            'email' => $request->email
        ]);
        
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'password' => 'required',
                'remember' => 'boolean'
            ]);

            if ($validator->fails()) {
                Log::debug('Login validation failed', [
                    'errors' => $validator->errors()->toArray()
                ]);
                
                return response()->json([
                    'status' => false,
                    'message' => 'Validation Error',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Validate credentials directly instead of using Auth::attempt
            // This avoids the CSRF token requirement
            $user = User::where('email', $request->email)->first();
            
            if (!$user || !Hash::check($request->password, $user->password)) {
                Log::debug('Authentication failed - invalid credentials', [
                    'email' => $request->email
                ]);
                
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid login credentials'
                ], 401);
            }
            
            // Remember me logic
            $remember = $request->boolean('remember', false);
            
            // Revoke all existing tokens
            $user->tokens()->delete();
            
            // Create new token with expiration based on remember me
            $expiration = $remember ? now()->addDays(30) : now()->addDay();
            $token = $user->createToken('auth_token', ['*'], $expiration)->plainTextToken;

            Log::debug('Login successful', [
                'user_id' => $user->id,
                'role' => $user->role,
                'remember' => $remember,
                'token_created' => true
            ]);

            return response()->json([
                'status' => true,
                'message' => 'Login successful',
                'data' => $user,
                'token' => $token,
                'expires_at' => $expiration->toISOString()
            ]);

        } catch (\Exception $e) {
            Log::error('Login exception', [
                'email' => $request->email ?? 'not provided',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'status' => false,
                'message' => 'Login failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Logout user - token based
     */
    public function logout(Request $request)
    {
        try {
            Log::debug('Logout attempt', [
                'user_id' => $request->user()->id ?? 'unknown'
            ]);
            
            // Revoke the token that was used to authenticate
            if ($request->user()) {
                $request->user()->currentAccessToken()->delete();
            }
            
            return response()->json([
                'status' => true,
                'message' => 'Successfully logged out'
            ]);

        } catch (\Exception $e) {
            Log::error('Logout failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'status' => false,
                'message' => 'Logout failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    /**
     * Get user profile
     */
    public function profile(Request $request)
    {
        try {
            return response()->json([
                'status' => true,
                'message' => 'Profile retrieved successfully',
                'data' => $request->user()
            ]);

        } catch (\Exception $e) {
            Log::error('Profile retrieval failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'status' => false,
                'message' => 'Failed to retrieve profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send password reset link
     */
    public function forgotPassword(Request $request)
    {
        Log::info('Forgot password request received', ['email' => $request->email]);
        
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email|exists:users,email'
            ]);

            if ($validator->fails()) {
                Log::error('Forgot password validation failed', [
                    'errors' => $validator->errors()->toArray()
                ]);
                return response()->json([
                    'status' => false,
                    'message' => 'Validation Error',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Generate token
            $token = Str::random(64);
            Log::info('Token generated');
            
            // Delete any existing password reset tokens for this email
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            
            // Insert new token
            DB::table('password_reset_tokens')->insert([
                'email' => $request->email,
                'token' => Hash::make($token),
                'created_at' => Carbon::now()
            ]);
            
            Log::info('Token saved to database');

            // Get the user
            $user = User::where('email', $request->email)->first();
            Log::info('User found', ['user_id' => $user->id]);

            // Create reset URL
            $frontendUrl = config('app.frontend_url');
            if (!$frontendUrl) {
                $frontendUrl = 'http://172.16.2.196:8080'; // Fallback URL
                Log::warning('APP_FRONTEND_URL not configured, using fallback');
            }
            
            $resetUrl = $frontendUrl . '/reset-password/' . $token;
            Log::info('Reset URL created');
            
            // Check if mail class exists
            if (!class_exists('App\Mail\ResetPasswordMail')) {
                Log::error('ResetPasswordMail class not found');
                
                // Use a simple mail instead
                Mail::send('emails.reset-password', [
                    'userName' => $user->name,
                    'resetUrl' => $resetUrl
                ], function ($message) use ($request) {
                    $message->to($request->email)
                            ->subject('Reset Your Password');
                });
            } else {
                // Send email with reset link
                Mail::to($request->email)->send(new ResetPasswordMail($user, $resetUrl));
            }
            
            Log::info('Email sent successfully');

            return response()->json([
                'status' => true,
                'message' => 'Password reset link sent to your email',
                'debug' => [
                    'url' => $resetUrl,
                    'mail_driver' => config('mail.default')
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Password reset failed', [
                'email' => $request->email ?? 'not provided',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'status' => false,
                'message' => 'Failed to send reset link',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reset password
     */
    public function resetPassword(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'token' => 'required|string',
                'email' => 'required|email|exists:users,email',
                'password' => 'required|string|min:8|confirmed',
                'password_confirmation' => 'required'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation Error',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Check if the token exists and is valid
            $passwordReset = DB::table('password_reset_tokens')
                ->where('email', $request->email)
                ->where('created_at', '>', Carbon::now()->subHours(2)) // Token expires after 2 hours
                ->first();

            if (!$passwordReset || !Hash::check($request->token, $passwordReset->token)) {
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid or expired reset token'
                ], 422);
            }

            // Update the user's password
            $user = User::where('email', $request->email)->first();
            $user->password = Hash::make($request->password);
            $user->save();

            // Delete the password reset token
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();

            // Optionally, you can log the user in automatically
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'status' => true,
                'message' => 'Password has been reset successfully',
                'token' => $token // Optional: auto-login after reset
            ]);

        } catch (\Exception $e) {
            Log::error('Reset password failed', [
                'email' => $request->email ?? 'not provided',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'status' => false,
                'message' => 'Failed to reset password',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}