<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('patients', function (Blueprint $table) {
            if (!Schema::hasColumn('patients', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        Schema::table('admissions', function (Blueprint $table) {
            if (!Schema::hasColumn('admissions', 'deleted_at')) {
                $table->softDeletes();
            }
        });
    }

    public function down()
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });

        Schema::table('admissions', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};