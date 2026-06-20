<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('programa', function (Blueprint $table) {
            $table->string('email_contacto')->nullable()->after('nombre')
                  ->comment('Correo del director o canal de notificación del departamento');
        });

        // Agregar el correo de Sistemas según lo indicado por el usuario
        DB::table('programa')
            ->where('nombre', 'like', '%sistema%')
            ->update(['email_contacto' => 'Ingsistemas@unisimon.edu.co']);
    }

    public function down()
    {
        Schema::table('programa', function (Blueprint $table) {
            $table->dropColumn('email_contacto');
        });
    }
};
