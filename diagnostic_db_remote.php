<?php
$host = '127.0.0.1';
$port = '3307';
$db   = 'mejora_profesoral';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
     $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
     throw new \PDOException($e->getMessage(), (int)$e->getCode());
}

$tables = [
    'usuarios_sistema',
    'periodos_evaluacion',
    'tareas_institucionales',
    'asignaciones_tareas',
    'evidencias_tareas',
    'evaluaciones_desempeno',
    'planes_trabajo_docente',
    'planes_mejora_ia',
    'acciones_plan_ia',
    'seguimiento_plan',
    'cursos',
    'profesor_curso',
    'programa'
];

echo "=== RECUENTO DE FILAS POR TABLA ===\n";
foreach ($tables as $t) {
    try {
        $count = $pdo->query("SELECT COUNT(*) FROM `$t`")->fetchColumn();
        echo "- $t: $count filas\n";
    } catch (\Exception $e) {
        echo "- $t: ERROR (" . $e->getMessage() . ")\n";
    }
}

echo "\n=== MUESTRA DE TAREAS INSTITUCIONALES ===\n";
try {
    $tareas = $pdo->query("SELECT id, management_area, activity, scope, specific_teacher_id, created_by, period_id FROM tareas_institucionales LIMIT 20")->fetchAll();
    print_r($tareas);
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}

echo "\n=== MUESTRA DE ASIGNACIONES ===\n";
try {
    $asig = $pdo->query("SELECT id, fixed_task_id, teacher_id, period_id, status FROM asignaciones_tareas LIMIT 20")->fetchAll();
    print_r($asig);
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
