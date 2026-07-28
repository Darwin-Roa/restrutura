const ftp = require("basic-ftp");
const fs = require("fs");

async function uploadTest() {
    const script = `<?php
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);

    echo "Booting Laravel...<br>";
    require __DIR__.'/../vendor/autoload.php';
    $app = require_once __DIR__.'/../bootstrap/app.php';
    
    $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
    $kernel->bootstrap();

    echo "Laravel booted successfully!<br>";
    
    try {
        echo "Testing DB connection via DB Facade...<br>";
        $results = Illuminate\Support\Facades\DB::select("SHOW TABLES");
        echo "SUCCESS! Connection works. Tables count: " . count($results) . "<br>";
        print_r($results);
    } catch (\\Exception $e) {
        echo "FAIL: " . $e->getMessage() . "<br>";
    }
    `;

    fs.writeFileSync("test_laravel.php", script);

    const client = new ftp.Client();
    try {
        await client.access({
            host: "152.53.68.13",
            user: "profesoral",
            password: "jp92#0C2r",
            secure: false
        });
        await client.uploadFrom("test_laravel.php", "/public/test_laravel.php");
        console.log("Uploaded test_laravel.php to /public");
    } catch(err) {
        console.error(err);
    }
    client.close();
}
uploadTest();
