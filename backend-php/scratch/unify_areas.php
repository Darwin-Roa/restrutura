<?php
try {
    $pdo = new PDO("mysql:host=127.0.0.1;port=3307;dbname=mejora_profesoral", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Starting database unification...\n";

    // 1. Update areas_gestion table
    $stmt1 = $pdo->prepare("UPDATE areas_gestion SET name = 'Investigación' WHERE name = 'Investigacion'");
    $stmt1->execute();
    $updatedAreas = $stmt1->rowCount();
    echo "- Updated {$updatedAreas} row(s) in areas_gestion.\n";

    // 2. Update tareas_institucionales table
    // Using BINARY to specifically target the unaccented version
    $stmt2 = $pdo->prepare("UPDATE tareas_institucionales SET management_area = 'Investigación' WHERE BINARY management_area = 'Investigacion'");
    $stmt2->execute();
    $updatedTasks = $stmt2->rowCount();
    echo "- Updated {$updatedTasks} row(s) in tareas_institucionales.\n";

    // 3. Make sure all other missing areas from tasks exist in areas_gestion so they can be selected in dropdowns
    $stmt3 = $pdo->query("SELECT DISTINCT management_area FROM tareas_institucionales");
    $allTaskAreas = $stmt3->fetchAll(PDO::FETCH_COLUMN);

    $stmt4 = $pdo->query("SELECT name FROM areas_gestion");
    $existingAreas = $stmt4->fetchAll(PDO::FETCH_COLUMN);

    $insertedAreas = 0;
    foreach ($allTaskAreas as $area) {
        // Simple case/accent-insensitive check
        $found = false;
        foreach ($existingAreas as $exArea) {
            if (mb_strtolower($area) === mb_strtolower($exArea)) {
                $found = true;
                break;
            }
        }
        if (!$found && !empty($area)) {
            $stmtInsert = $pdo->prepare("INSERT INTO areas_gestion (name, is_active) VALUES (?, 1)");
            $stmtInsert->execute([$area]);
            echo "- Added missing area to areas_gestion catalog: '{$area}'\n";
            $insertedAreas++;
        }
    }

    echo "Unification completed successfully!\n";

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
