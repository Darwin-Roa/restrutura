<?php
try {
    $pdo = new PDO("mysql:host=127.0.0.1;port=3307;dbname=mejora_profesoral", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $pdo->query("SELECT id, management_area FROM tareas_institucionales");
    $groups = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $area = $row['management_area'];
        if (!isset($groups[$area])) {
            $groups[$area] = [];
        }
        $groups[$area][] = $row['id'];
    }

    echo "PHP Grouped unique management_areas from tareas_institucionales:\n";
    foreach ($groups as $area => $ids) {
        echo "- '{$area}' (" . count($ids) . " tasks): IDs " . implode(',', $ids) . "\n";
    }

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
