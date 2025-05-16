<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken as Middleware;

class VerifyCsrfToken extends Middleware
{
    /**
     * The URIs that should be excluded from CSRF verification.
     *
     * @var array<int, string>
     */
    protected $except = [
        // Exclude API endpoints from CSRF protection
        'api/*',
        'sanctum/csrf-cookie',
        'api/login',
        'api/logout',
        'api/register',
        'api/forgot-password',
        'api/reset-password',
    ];
}