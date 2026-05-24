<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

try {
    DB::statement('SET FOREIGN_KEY_CHECKS=0');

    // evidencias_tareas
    try { DB::statement('ALTER TABLE evidencias_tareas DROP FOREIGN KEY evidencias_tareas_ibfk_1'); } catch(\Exception $e) {}
    try { DB::statement('ALTER TABLE evidencias_tareas DROP FOREIGN KEY evidencias_tareas_ibfk_5'); } catch(\Exception $e) {}
    DB::statement('UPDATE evidencias_tareas SET teacher_id = NULL WHERE teacher_id NOT IN (SELECT id FROM usuarios)');
    DB::statement('UPDATE evidencias_tareas SET verified_by = NULL WHERE verified_by NOT IN (SELECT id FROM usuarios)');
    DB::statement('ALTER TABLE evidencias_tareas ADD CONSTRAINT evidencias_tareas_teacher_fk FOREIGN KEY (teacher_id) REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE');
    DB::statement('ALTER TABLE evidencias_tareas ADD CONSTRAINT evidencias_tareas_verified_by_fk FOREIGN KEY (verified_by) REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE');

    // periodos_evaluacion
    try { DB::statement('ALTER TABLE periodos_evaluacion DROP FOREIGN KEY periodos_evaluacion_ibfk_1'); } catch(\Exception $e) {}
    DB::statement('UPDATE periodos_evaluacion SET created_by = NULL WHERE created_by NOT IN (SELECT id FROM usuarios)');
    DB::statement('ALTER TABLE periodos_evaluacion ADD CONSTRAINT periodos_evaluacion_created_by_fk FOREIGN KEY (created_by) REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE');

    // planes_mejora_ia
    try { DB::statement('ALTER TABLE planes_mejora_ia DROP FOREIGN KEY planes_mejora_ia_ibfk_4'); } catch(\Exception $e) {}
    DB::statement('UPDATE planes_mejora_ia SET reviewed_by = NULL WHERE reviewed_by NOT IN (SELECT id FROM usuarios)');
    DB::statement('ALTER TABLE planes_mejora_ia ADD CONSTRAINT planes_mejora_ia_reviewed_by_fk FOREIGN KEY (reviewed_by) REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE');

    // profesor_curso
    try { DB::statement('ALTER TABLE profesor_curso DROP FOREIGN KEY profesor_curso_ibfk_1'); } catch(\Exception $e) {}
    DB::statement('DELETE FROM profesor_curso WHERE teacher_id NOT IN (SELECT id FROM usuarios)');
    DB::statement('ALTER TABLE profesor_curso ADD CONSTRAINT profesor_curso_teacher_fk FOREIGN KEY (teacher_id) REFERENCES usuarios(id) ON DELETE CASCADE ON UPDATE CASCADE');

    // reconocimientos_ia
    try { DB::statement('ALTER TABLE reconocimientos_ia DROP FOREIGN KEY reconocimientos_ia_ibfk_1'); } catch(\Exception $e) {}
    try { DB::statement('ALTER TABLE reconocimientos_ia DROP FOREIGN KEY reconocimientos_ia_ibfk_4'); } catch(\Exception $e) {}
    DB::statement('UPDATE reconocimientos_ia SET teacher_id = NULL WHERE teacher_id NOT IN (SELECT id FROM usuarios)');
    DB::statement('UPDATE reconocimientos_ia SET published_by = NULL WHERE published_by NOT IN (SELECT id FROM usuarios)');
    DB::statement('ALTER TABLE reconocimientos_ia ADD CONSTRAINT reconocimientos_ia_teacher_fk FOREIGN KEY (teacher_id) REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE');
    DB::statement('ALTER TABLE reconocimientos_ia ADD CONSTRAINT reconocimientos_ia_published_by_fk FOREIGN KEY (published_by) REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE');

    // tareas_institucionales
    try { DB::statement('ALTER TABLE tareas_institucionales DROP FOREIGN KEY tareas_institucionales_ibfk_1'); } catch(\Exception $e) {}
    DB::statement('UPDATE tareas_institucionales SET specific_teacher_id = NULL WHERE specific_teacher_id NOT IN (SELECT id FROM usuarios)');
    DB::statement('ALTER TABLE tareas_institucionales ADD CONSTRAINT tareas_institucionales_teacher_fk FOREIGN KEY (specific_teacher_id) REFERENCES usuarios(id) ON DELETE SET NULL ON UPDATE CASCADE');

    DB::statement('SET FOREIGN_KEY_CHECKS=1');

    echo "Successfully fixed all broken foreign keys pointing to usuarios_sistema!\n";
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
