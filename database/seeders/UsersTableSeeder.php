<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsersTableSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admitting User',
            'email' => 'admitting@example.com',
            'password' => Hash::make('admin123'),
            'role' => 'admitting'
        ]);

        User::create([
            'name' => 'Billing User',
            'email' => 'billing@example.com',
            'password' => Hash::make(value: 'admin123'),
            'role' => 'billing'
        ]);
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make(value: 'admin123'),
            'role' => 'admin',
        ]);
    }
}
