<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Patient extends Model
{
    use SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'middle_name',
        'name_initial',
        'date_of_birth',
        'room_number',
        'ward_type',
        'attending_physician',
        'remarks'

    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    /**
     * Ward type validation rules.
     *
     * @var array<string>
     */
    public static $wardTypes = ['ward', 'semi-private', 'private', 'executive', 'suite'];

    /**
     * Get all admissions for the patient
     */
    public function admissions(): HasMany
    {
        return $this->hasMany(Admission::class);
    }

    /**
     * Get the active admission for the patient
     */
    public function activeAdmission()
    {
        return $this->hasOne(Admission::class)
            ->where('status', 'active')
            ->latest();
    }

    /**
     * Get all portal access records for the patient
     */
    public function portalAccess(): HasMany
    {
        return $this->hasMany(PortalAccess::class);
    }
}
