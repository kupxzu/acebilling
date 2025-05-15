<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('admissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->onDelete('cascade');
            $table->datetime('admission_date');
            $table->datetime('discharge_date')->nullable();
            $table->string('room_number');
            $table->enum('ward_type', ['private', 'semi-private', 'ward' , 'executive', 'suite']);
            $table->string('attending_physician');
            $table->enum('status', ['active', 'discharged', 'transferred'])->default('active');
            $table->text('remarks')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admissions');
    }
};
