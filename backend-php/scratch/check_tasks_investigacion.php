<?php
try {
    $pdo = new PDO("mysql:host=127.0.0.1;port=3307;dbname=mejora_profesoral", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "--- DETAILED TASKS (tareas_institucionales) WHERE management_area LIKE '%investigacion%' ---\n";
    $stmt = $pdo->query("SELECT id, management_area, activity FROM tareas_institucionales WHERE management_area LIKE '%investigacion%'");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "- ID: {$row['id']}, Area: '{$row['management_area']}', Activity: '" . substr($row['activity'], 0, 50) . "...'\n";
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
