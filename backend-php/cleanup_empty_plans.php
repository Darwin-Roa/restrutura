<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$plans = App\Models\ImprovementPlan::with('actions')->where('period_id', 2)->get();
$count = 0;
foreach($plans as $p) {
    if($p->actions->count() == 0) {
        echo "Plan vacio eliminado ID: {$p->id}\n";
        $p->forceDelete();
        $count++;
    }
}
echo "Total empty plans deleted: {$count}\n";
