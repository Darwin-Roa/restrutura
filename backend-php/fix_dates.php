<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\ImprovementPlan;
use App\Models\Period;
use App\Models\PlanAction;

echo "Iniciando corrección de fechas...\n";
$plans = ImprovementPlan::with('actions')->get();
$actionsUpdated = 0;
$plansUpdated = 0;

foreach($plans as $plan) {
    $period = Period::find($plan->period_id);
    if($period) {
        // Ajustamos la fecha de generación del plan al inicio del periodo o algo intermedio
        if (!$plan->ai_generated_at || $plan->ai_generated_at < $period->start_date || $plan->ai_generated_at > $period->end_date) {
            $plan->ai_generated_at = $period->start_date;
            $plan->save();
            $plansUpdated++;
        }
        
        // Ajustamos el deadline de todas las acciones de este plan al final del periodo
        foreach($plan->actions as $action) {
            if ($action->deadline !== $period->end_date) {
                $action->deadline = $period->end_date;
                $action->save();
                $actionsUpdated++;
            }
        }
    }
}
echo "Completado.\n";
echo "Planes corregidos: $plansUpdated\n";
echo "Tareas (acciones) corregidas: $actionsUpdated\n";
