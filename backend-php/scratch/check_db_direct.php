<?php
try {
    $pdo = new PDO("mysql:host=127.0.0.1;port=3307;dbname=mejora_profesoral", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "--- AREAS_GESTION TABLE ---\n";
    $stmt = $pdo->query("SELECT id, name, is_active FROM areas_gestion");
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo "- ID: {$row['id']}, Name: '{$row['name']}', Active: {$row['is_active']}\n";
    }

    echo "\n--- UNIQUE AREAS IN TAREAS_INSTITUCIONALES TABLE ---\n";
    $stmt2 = $pdo->query("SELECT DISTINCT management_area FROM tareas_institucionales");
    while ($row = $stmt2->fetch(PDO::FETCH_ASSOC)) {
        echo "- '{$row['management_area']}'\n";
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
