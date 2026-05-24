<?php

// Bootstrap Laravel
require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Http\Controllers\HistoryController;
use Illuminate\Http\Request;
use App\Models\User;

// Find a Director
$director = User::where('role', 'director')->first();
if (!$director) {
    die("No director found in DB to mock request.\n");
}

echo "Mocking request as Director: {$director->name} (Prog ID: {$director->programa_id})\n";

$request = new Request();
$request->setUserResolver(function () use ($director) {
    return $director;
});

$controller = new HistoryController();

echo "\n--- TESTING getGlobalHistory ---\n";
try {
    $response = $controller->getGlobalHistory($request);
    echo "Status Code: " . $response->getStatusCode() . "\n";
    $data = json_decode($response->getContent(), true);
    if ($data['success']) {
        echo "Success: true\n";
        echo "Total evaluations_timeline: " . count($data['data']['evaluations_timeline'] ?? []) . "\n";
        echo "Total plans_distribution: " . count($data['data']['plans_distribution'] ?? []) . "\n";
        echo "Total history: " . count($data['data']['history'] ?? []) . "\n";
        if (count($data['data']['evaluations_timeline'] ?? []) > 0) {
            echo "First timeline entry: " . json_encode($data['data']['evaluations_timeline'][0], JSON_PRETTY_PRINT) . "\n";
        }
    } else {
        echo "Success: false, Error: " . ($data['error'] ?? 'Unknown') . "\n";
    }
} catch (\Exception $e) {
    echo "Caught Exception: " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n";
}
