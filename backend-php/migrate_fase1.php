<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
use Illuminate\Support\Facades\DB;

try {
    echo "Reintentando Fase 1 - Borrando tablas...\n";
    DB::statement("SET FOREIGN_KEY_CHECKS=0;");
    
    DB::statement("DROP TABLE IF EXISTS `user`");
    DB::statement("DROP TABLE IF EXISTS `evaluation`");
    DB::statement("DROP TABLE IF EXISTS `improvement_plan`");
    DB::statement("DROP TABLE IF EXISTS `plan_action`");
    DB::statement("DROP TABLE IF EXISTS `task_assignment`");
    DB::statement("DROP TABLE IF EXISTS `teacher_course`");
    DB::statement("DROP TABLE IF EXISTS `fixed_task`");
    DB::statement("DROP TABLE IF EXISTS `period`");
    DB::statement("DROP TABLE IF EXISTS `student_comment`");
    DB::statement("DROP TABLE IF EXISTS `usuarios_sistema`");
    DB::statement("DROP TABLE IF EXISTS `course`"); // We missed this one
    DB::statement("DROP TABLE IF EXISTS `department`");
    DB::statement("DROP TABLE IF EXISTS `evidence`");
    DB::statement("DROP TABLE IF EXISTS `management_area`");

    DB::statement("SET FOREIGN_KEY_CHECKS=1;");
    
    echo "Fase 1 completada exitosamente. Tablas eliminadas.\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
