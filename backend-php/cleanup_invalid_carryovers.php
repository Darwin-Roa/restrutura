<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\ImprovementPlan;
use App\Models\PlanAction;
use App\Models\Period;

$period2025 = Period::where('name', '2025-2')->first();
if (!$period2025) {
    echo "Period 2025-2 not found.\n";
    exit;
}

echo "Buscando tareas arrastradas incorrectamente en {$period2025->name}...\n";

// Buscar planes en el periodo 2025-2
$plans = ImprovementPlan::with('actions')->where('period_id', $period2025->id)->get();

$actionsDeleted = 0;
$plansDeleted = 0;

foreach ($plans as $plan) {
    $planModified = false;
    foreach ($plan->actions as $action) {
        if ($action->carry_over_count > 0) {
            echo "- Eliminando acción ID {$action->id} ('{$action->concrete_action}') del plan ID {$plan->id}\n";
            $action->delete();
            $actionsDeleted++;
            $planModified = true;
        }
    }
    
    if ($planModified) {
        // Refrescar las acciones del plan
        $plan->load('actions');
        if ($plan->actions->count() === 0 && str_contains($plan->diagnosis_text, 'Plan autogenerado')) {
            echo "  -> Eliminando plan vacío autogenerado ID {$plan->id}\n";
            $plan->forceDelete();
            $plansDeleted++;
        }
    }
}

echo "Total acciones eliminadas: $actionsDeleted\n";
echo "Total planes autogenerados eliminados: $plansDeleted\n";
echo "¡Limpieza completada!\n";
