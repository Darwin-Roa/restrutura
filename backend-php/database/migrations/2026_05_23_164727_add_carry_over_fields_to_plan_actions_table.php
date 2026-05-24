<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('acciones_plan_ia', function (Blueprint $table) {
            $table->integer('carry_over_count')->default(0);
            $table->boolean('needs_carry_over')->default(false);
        });
        
        // Also modify enum if needed, but since enum changes in raw MySQL can be tricky via Blueprint in older Laravel, 
        // we can just run a raw query to add 'not_delivered' if it doesn't exist, though typically Laravel can do it or we just use strings.
        // Actually, the DB has `status` enum('pending','in_progress','completed','verified','rejected')
        DB::statement("ALTER TABLE acciones_plan_ia MODIFY COLUMN status ENUM('pending','in_progress','completed','verified','rejected','not_delivered') DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('acciones_plan_ia', function (Blueprint $table) {
            $table->dropColumn('carry_over_count');
            $table->dropColumn('needs_carry_over');
        });
        DB::statement("ALTER TABLE acciones_plan_ia MODIFY COLUMN status ENUM('pending','in_progress','completed','verified','rejected') DEFAULT 'pending'");
    }
};
