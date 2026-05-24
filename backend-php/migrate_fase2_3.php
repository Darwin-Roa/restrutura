<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
use Illuminate\Support\Facades\DB;

try {
    echo "Fase 2 - Poblando permisos...\n";
    DB::statement("SET FOREIGN_KEY_CHECKS=0;");
    DB::statement("TRUNCATE TABLE `role_has_permissions`");
    DB::statement("TRUNCATE TABLE `user_has_permissions`");
    DB::statement("TRUNCATE TABLE `permissions`");
    DB::statement("SET FOREIGN_KEY_CHECKS=1;");

    DB::statement("
        INSERT INTO `permissions` (`id`, `name`, `created_at`, `updated_at`) VALUES
        (1,  'ver_dashboard',          NOW(), NOW()),
        (2,  'ver_notificaciones',     NOW(), NOW()),
        (3,  'subir_evaluacion',       NOW(), NOW()),
        (4,  'ver_evaluaciones',       NOW(), NOW()),
        (5,  'editar_evaluacion',      NOW(), NOW()),
        (6,  'eliminar_evaluacion',    NOW(), NOW()),
        (7,  'generar_plan_ia',        NOW(), NOW()),
        (8,  'ver_planes',             NOW(), NOW()),
        (9,  'editar_plan',            NOW(), NOW()),
        (10, 'aprobar_planes',         NOW(), NOW()),
        (11, 'eliminar_plan',          NOW(), NOW()),
        (12, 'ver_historial',          NOW(), NOW()),
        (13, 'ver_seguimiento_global', NOW(), NOW()),
        (14, 'ver_estadisticas',       NOW(), NOW()),
        (15, 'analisis_ia',            NOW(), NOW()),
        (16, 'plan_trabajo',           NOW(), NOW()),
        (17, 'crear_tarea',            NOW(), NOW()),
        (18, 'editar_tarea',           NOW(), NOW()),
        (19, 'eliminar_tarea',         NOW(), NOW()),
        (20, 'asignar_tareas',         NOW(), NOW()),
        (21, 'enviar_recordatorios',   NOW(), NOW()),
        (22, 'bandeja_evidencias',     NOW(), NOW()),
        (23, 'subir_evidencia',        NOW(), NOW()),
        (24, 'verificar_evidencias',   NOW(), NOW()),
        (25, 'descargar_evidencia',    NOW(), NOW()),
        (26, 'exportar',               NOW(), NOW()),
        (27, 'exportar_excel',         NOW(), NOW()),
        (28, 'exportar_global',        NOW(), NOW()),
        (29, 'gestionar_cursos',       NOW(), NOW()),
        (30, 'crear_curso',            NOW(), NOW()),
        (31, 'eliminar_curso',         NOW(), NOW()),
        (32, 'asignar_cursos',         NOW(), NOW()),
        (33, 'gestionar_usuarios',     NOW(), NOW()),
        (34, 'crear_usuario',          NOW(), NOW()),
        (35, 'editar_usuario',         NOW(), NOW()),
        (36, 'desactivar_usuario',     NOW(), NOW()),
        (37, 'gestionar_roles',        NOW(), NOW()),
        (38, 'gestionar_periodos',     NOW(), NOW()),
        (39, 'gestionar_areas',        NOW(), NOW()),
        (40, 'gestionar_departamentos',NOW(), NOW()),
        (41, 'ver_buenas_practicas',   NOW(), NOW()),
        (42, 'publicar_reconocimiento',NOW(), NOW());
    ");

    echo "Asignando permisos a roles (role_has_permissions)...\n";
    // Admin
    DB::statement("
        INSERT INTO `role_has_permissions` (`role_name`, `permission_id`, `created_at`)
        SELECT 'admin', id, NOW() FROM `permissions`;
    ");
    // Director
    DB::statement("
        INSERT INTO `role_has_permissions` (`role_name`, `permission_id`, `created_at`)
        SELECT 'director', id, NOW() FROM `permissions`
        WHERE name NOT IN (
            'eliminar_evaluacion','eliminar_plan','gestionar_usuarios',
            'crear_usuario','editar_usuario','desactivar_usuario',
            'gestionar_roles','gestionar_periodos','gestionar_areas',
            'gestionar_departamentos','ver_estadisticas'
        );
    ");
    // Coordinador
    DB::statement("
        INSERT INTO `role_has_permissions` (`role_name`, `permission_id`, `created_at`)
        SELECT 'coordinador', id, NOW() FROM `permissions`
        WHERE name IN (
            'ver_dashboard','ver_notificaciones','subir_evaluacion',
            'ver_evaluaciones','generar_plan_ia','ver_planes','aprobar_planes',
            'ver_historial','ver_seguimiento_global','ver_estadisticas',
            'plan_trabajo','crear_tarea','editar_tarea','asignar_tareas',
            'enviar_recordatorios','bandeja_evidencias','verificar_evidencias',
            'descargar_evidencia','exportar','exportar_excel','gestionar_cursos',
            'crear_curso','asignar_cursos','ver_buenas_practicas'
        );
    ");
    // Profesor
    DB::statement("
        INSERT INTO `role_has_permissions` (`role_name`, `permission_id`, `created_at`)
        SELECT 'profesor', id, NOW() FROM `permissions`
        WHERE name IN (
            'ver_dashboard','ver_planes','plan_trabajo',
            'bandeja_evidencias','subir_evidencia',
            'descargar_evidencia','ver_buenas_practicas'
        );
    ");
    // Asistente
    DB::statement("
        INSERT INTO `role_has_permissions` (`role_name`, `permission_id`, `created_at`)
        SELECT 'asistente_', id, NOW() FROM `permissions`
        WHERE name IN (
            'ver_seguimiento_global','subir_evaluacion','analisis_ia'
        );
    ");

    echo "Fase 3 - Modificando roles_sistema...\n";
    $columns = DB::select("SHOW COLUMNS FROM roles_sistema LIKE 'created_by'");
    if (count($columns) == 0) {
        DB::statement("
            ALTER TABLE `roles_sistema`
            ADD COLUMN `created_by` int(11) DEFAULT NULL,
            ADD CONSTRAINT `fk_roles_created_by`
                FOREIGN KEY (`created_by`) REFERENCES `usuarios`(`id`)
                ON DELETE SET NULL;
        ");
        echo "Columna created_by añadida.\n";
    } else {
        echo "La columna created_by ya existía.\n";
    }

    echo "¡Fase 2 y 3 completadas!\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
