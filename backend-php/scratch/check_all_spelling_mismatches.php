<?php
try {
    $pdo = new PDO("mysql:host=127.0.0.1;port=3307;dbname=mejora_profesoral", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Get valid areas
    $stmt = $pdo->query("SELECT name FROM areas_gestion");
    $validAreas = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Standard areas in areas_gestion:\n";
    print_r($validAreas);

    // Get all distinct strings from tasks
    echo "\nAll exact distinct management_areas in tasks:\n";
    $stmt2 = $pdo->query("SELECT DISTINCT management_area FROM tareas_institucionales");
    $taskAreas = $stmt2->fetchAll(PDO::FETCH_COLUMN);
    
    foreach ($taskAreas as $area) {
        $count = $pdo->query("SELECT COUNT(*) FROM tareas_institucionales WHERE BINARY management_area = " . $pdo->quote($area))->fetchColumn();
        echo "- '{$area}' ($count tasks)\n";
    }

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
