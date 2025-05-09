<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Admission extends Model
{
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'patient_id',
        'admission_date',
        'discharge_date',
        'room_number',
        'ward_type',
        'attending_physician',
        'status',
        'remarks'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'admission_date' => 'datetime',
        'discharge_date' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    /**
     * Get the patient that owns the admission.
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    /**
     * Get the billings associated with the admission.
     */
    public function billings(): HasMany
    {
        return $this->hasMany(Billing::class);
    }

    /**
     * Get the total pending bill amount for the admission.
     */
    public function getTotalBillAttribute(): float
    {
        return $this->billings()
            ->where('status', 'pending')
            ->sum('amount');
    }

    /**
     * Get the total paid amount for the admission.
     */
    public function getPaidAmountAttribute(): float
    {
        return $this->billings()
            ->where('status', 'paid')
            ->sum('amount');
    }
}
