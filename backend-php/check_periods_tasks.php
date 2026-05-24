<?php
try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3307;dbname=mejora_profesoral', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "=== PERIODOS ===\n";
    $q = $pdo->query("SELECT id, name, start_date, end_date, is_active FROM periodos_evaluacion");
    while($r = $q->fetch(PDO::FETCH_ASSOC)) {
        echo json_encode($r) . "\n";
    }

    echo "\n=== TAREAS INSTITUCIONALES (Primeras 10) ===\n";
    $q = $pdo->query("SELECT id, management_area, activity, scope, created_by, period_id, is_active FROM tareas_institucionales LIMIT 10");
    while($r = $q->fetch(PDO::FETCH_ASSOC)) {
        echo json_encode($r) . "\n";
    }

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
