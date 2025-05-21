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
    private function checkAdminAccess()
    {
        if (!auth()->check() || auth()->user()->role !== 'admin') {
            return response()->json([
                'status' => false,
                'message' => 'Unauthorized. Admin access required.'
            ], 403);
        }
        return true;
    }

    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        try {
            $adminCheck = $this->checkAdminAccess();
            if ($adminCheck !== true) {
                return $adminCheck;
            }

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
        Log::debug('Login attempt started', [
            'email' => $request->email,
            'remember' => $request->boolean('remember', false)
        ]);
        
        try {
            // 1. Validate input
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'password' => 'required',
                'remember' => 'boolean'
            ]);

            if ($validator->fails()) {
                Log::warning('Login validation failed', [
                    'errors' => $validator->errors()->toArray()
                ]);
                return response()->json([
                    'status' => false,
                    'message' => 'Validation Error',
                    'errors' => $validator->errors()
                ], 422);
            }

            // 2. Find user and verify credentials
            $user = User::where('email', $request->email)->first();
            
            if (!$user || !Hash::check($request->password, $user->password)) {
                Log::warning('Login failed - invalid credentials', ['email' => $request->email]);
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid login credentials'
                ], 401);
            }

            // 3. Handle token management
            Log::debug('Revoking existing tokens');
            $user->tokens()->delete();
            
            // 4. Set up new authentication
            $remember = $request->boolean('remember', false);
            $expiration = $remember ? now()->addDays(30) : now()->addHours(12);
            
            Log::debug('Creating new token', [
                'user_id' => $user->id,
                'remember' => $remember,
                'expiration' => $expiration
            ]);

            // Create token with proper expiration
            $token = $user->createToken('auth_token')->plainTextToken;

            // Hide sensitive data
            $user->makeVisible(['name', 'email', 'role']);
            $user->makeHidden(['password', 'remember_token']);

            Log::info('Login successful', [
                'user_id' => $user->id,
                'role' => $user->role,
                'remember' => $remember
            ]);

            // 5. Return success response
            return response()->json([
                'status' => true,
                'message' => 'Login successful',
                'data' => $user,
                'token' => $token,
                'expires_at' => $expiration->toISOString(),
                'remember' => $remember
            ]);

        } catch (\Exception $e) {
            Log::error('Login exception', [
                'email' => $request->email ?? 'not provided',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'status' => false,
                'message' => 'Login failed. Please try again.',
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
                $frontendUrl = 'http://billing.api'; // Fallback URL
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

    /**
     * Get all users
     */
    public function index()
    {
        try {
            $adminCheck = $this->checkAdminAccess();
            if ($adminCheck !== true) {
                return $adminCheck;
            }

            $users = User::select(['id', 'name', 'email', 'role', 'created_at'])
                        ->orderBy('name')
                        ->paginate(10); // Add pagination with 10 items per page

            return response()->json([
                'status' => true,
                'message' => 'Users retrieved successfully',
                'data' => $users // This will include pagination metadata
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to retrieve users: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to retrieve users'
            ], 500);
        }
    }

    /**
     * Update user
     */
    public function update(Request $request, $id)
    {
        try {
            $adminCheck = $this->checkAdminAccess();
            if ($adminCheck !== true) {
                return $adminCheck;
            }

            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email,' . $id,
                'role' => 'required|in:admin,billing,admitting'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'status' => false,
                    'message' => 'Validation Error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = User::findOrFail($id);
            
            $user->update([
                'name' => $request->name,
                'email' => $request->email,
                'role' => $request->role
            ]);

            // Update password if provided
            if ($request->filled('password')) {
                $user->password = Hash::make($request->password);
                $user->save();
            }

            return response()->json([
                'status' => true,
                'message' => 'User updated successfully',
                'data' => $user
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to update user', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'status' => false,
                'message' => 'Failed to update user',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete user
     */
    public function destroy($id)
    {
        try {
            $adminCheck = $this->checkAdminAccess();
            if ($adminCheck !== true) {
                return $adminCheck;
            }

            $user = User::findOrFail($id);
            $user->delete();

            return response()->json([
                'status' => true,
                'message' => 'User deleted successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to delete user: ' . $e->getMessage());
            return response()->json([
                'status' => false,
                'message' => 'Failed to delete user'
            ], 500);
        }
    }

    /**
     * Verify token validity
     */
    public function verifyToken(Request $request)
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'status' => false,
                    'message' => 'Invalid token'
                ], 401);
            }

            return response()->json([
                'status' => true,
                'message' => 'Token is valid',
                'data' => $user
            ]);

        } catch (\Exception $e) {
            Log::error('Token verification failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'status' => false,
                'message' => 'Token verification failed'
            ], 401);
        }
    }
}