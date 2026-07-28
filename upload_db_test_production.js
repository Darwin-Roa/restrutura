const ftp = require("basic-ftp");
const fs = require("fs");

async function uploadTest() {
    const script = `<?php
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
    `;

    fs.writeFileSync("test_conn.php", script);

    const client = new ftp.Client();
    try {
        await client.access({
            host: "152.53.68.13",
            user: "profesoral",
            password: "jp92#0C2r",
            secure: false
        });
        await client.uploadFrom("test_conn.php", "/public/test_conn.php");
        console.log("Uploaded test_conn.php to /public");
    } catch(err) {
        console.error(err);
    }
    client.close();
}
uploadTest();
