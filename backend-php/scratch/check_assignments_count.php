<?php
$pdo = new PDO("mysql:host=127.0.0.1;port=3307;dbname=mejora_profesoral", "root", "");
$stmt = $pdo->query("SELECT count(*) FROM task_assignments");
echo "Total assignments: " . $stmt->fetchColumn() . "\n";
$stmt2 = $pdo->query("SELECT count(*) FROM users WHERE role = 'profesor' AND is_active = 1");
echo "Total professors: " . $stmt2->fetchColumn() . "\n";
$stmt3 = $pdo->query("SELECT count(*) FROM fixed_tasks WHERE period_id = (SELECT id FROM periods WHERE is_active=1 LIMIT 1)");
echo "Total fixed tasks active period: " . $stmt3->fetchColumn() . "\n";
