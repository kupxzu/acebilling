<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Billing extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'admission_id',
        'description',
        'category',
        'amount',
        'status',
        'remarks'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    public static $categories = [
        'room',
        'medicine',
        'laboratory',
        'professional_fee',
        'others'
    ];

    public static $statuses = [
        'pending',
        'paid',
        'cancelled'
    ];

    public function admission(): BelongsTo
    {
        return $this->belongsTo(Admission::class);
    }
}