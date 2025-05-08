<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'room_number',
        'ward_type',
        'attending_physician',
        'qr_code'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Generate a unique QR code URL for the patient
     *
     * @return string
     */
    public function getQrUrlAttribute()
    {
        return url("/patient/{$this->id}");
    }

    /**
     * Get the patient's admission record
     */
    public function admission()
    {
        return $this->hasOne(Admission::class)->latest();
    }

    /**
     * Get all admissions for the patient
     */
    public function admissions()
    {
        return $this->hasMany(Admission::class);
    }
}
