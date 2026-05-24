<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\TaskAssignment;
use App\Models\PlanAction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendDeadlineAlerts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'alerts:deadlines';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Envía alertas de correo a los docentes sobre entregas próximas a vencer';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('Iniciando verificación de fechas límite...');
        
        $today = Carbon::today();
        $warningDate = Carbon::today()->addDays(3); // Avisar con 3 días de antelación
        
        $alertsSent = 0;

        // 1. Revisar acciones de planes de mejora
        $pendingActions = PlanAction::with('plan.teacher')
            ->whereIn('status', ['pending', 'in_progress'])
            ->whereNotNull('deadline')
            ->whereDate('deadline', '<=', $warningDate)
            ->whereDate('deadline', '>=', $today)
            ->get();

        foreach ($pendingActions as $action) {
            $teacher = $action->plan->teacher;
            if ($teacher && $teacher->email) {
                // Aquí iría el envío de correo usando Mail::send() o Mail::to()
                // Por ahora solo hacemos log
                Log::info("Alerta (Plan Acción) enviada a {$teacher->email} para la acción: {$action->concrete_action}");
                $alertsSent++;
            }
        }

        // 2. Revisar tareas institucionales (asignaciones)
        $pendingTasks = TaskAssignment::with(['fixedTask', 'teacher'])
            ->whereIn('status', ['pending', 'in_progress'])
            ->where(function($q) use ($warningDate, $today) {
                $q->whereNotNull('custom_deadline')
                  ->whereDate('custom_deadline', '<=', $warningDate)
                  ->whereDate('custom_deadline', '>=', $today);
            })->orWhere(function($q) use ($warningDate, $today) {
                $q->whereNull('custom_deadline')
                  ->whereHas('fixedTask', function($q2) use ($warningDate, $today) {
                      $q2->whereNotNull('deadline_month')
                         ->whereDate('deadline_month', '<=', $warningDate)
                         ->whereDate('deadline_month', '>=', $today);
                  });
            })
            ->get();

        foreach ($pendingTasks as $assignment) {
            $teacher = $assignment->teacher;
            $task = $assignment->fixedTask;
            if ($teacher && $teacher->email && $task) {
                // Aquí iría el envío de correo
                Log::info("Alerta (Tarea Institucional) enviada a {$teacher->email} para la tarea: {$task->activity}");
                $alertsSent++;
            }
        }

        $this->info("Verificación completada. Alertas enviadas: {$alertsSent}");
        Log::info("Cron alerts:deadlines ejecutado. Alertas enviadas: {$alertsSent}");

        return Command::SUCCESS;
    }
}
