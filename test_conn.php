<?php
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);

    echo "Testing MariaDB connection...<br>";
    $host = '159.195.15.66';
    $port = '3307';
    $db   = 'unisimon';
    $user = 'unisimon';
    $pass = '9nHYoDWInA9oPUS2aRA3';
    
    try {
        $pdo = new PDO("mysql:host=$host;port=$port;dbname=$db", $user, $pass);
        echo "SUCCESS: Connected to MariaDB database!<br>";
        
        // Show table count
        $stmt = $pdo->query("SHOW TABLES");
        echo "Tables found:<br>";
        while ($row = $stmt->fetch(PDO::FETCH_NUM)) {
            echo "- " . $row[0] . "<br>";
        }
    } catch (PDOException $e) {
        echo "FAIL: " . $e->getMessage() . "<br>";
    }
    