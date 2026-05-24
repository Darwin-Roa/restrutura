<?php
$start = microtime(true);
$pdo = new PDO('mysql:host=127.0.0.1;port=3307;dbname=mejora_profesoral', 'root', '');
echo "Connected in " . (microtime(true) - $start) . "s\n";
$pdo->query("SELECT 1");
echo "Query in " . (microtime(true) - $start) . "s\n";
