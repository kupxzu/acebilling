<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PortalAccess extends Model
{
    protected $table = 'portal_access';
    
    protected $fillable = [
        'patient_id',
        'access_token',
        'qr_code',
        'expires_at'
    ];

    protected $casts = [
        'expires_at' => 'datetime'
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}