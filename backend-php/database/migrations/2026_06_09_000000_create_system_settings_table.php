<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique()->comment('Clave única de configuración');
            $table->text('value')->comment('Valor (puede ser JSON o texto plano)');
            $table->timestamps();
        });

        // Insertar valor por defecto: avisar 7, 3 y 1 día antes del vencimiento
        DB::table('system_settings')->insert([
            'key'        => 'dias_alertas_programadas',
            'value'      => json_encode([7, 3, 1]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down()
    {
        Schema::dropIfExists('system_settings');
    }
};
