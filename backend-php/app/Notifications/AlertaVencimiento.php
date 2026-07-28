<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AlertaVencimiento extends Notification implements ShouldQueue
{
    use Queueable;

    protected string $actividad;
    protected int    $diasRestantes;
    protected string $tipo; // 'tarea' o 'plan'

    public function __construct(string $actividad, int $diasRestantes, string $tipo = 'tarea')
    {
        $this->actividad     = $actividad;
        $this->diasRestantes = $diasRestantes;
        $this->tipo          = $tipo;
    }

    public function via($notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable): MailMessage
    {
        $isHours = str_ends_with($this->tipo, '_hours');
        $baseTipo = str_starts_with($this->tipo, 'plan') ? 'plan' : 'tarea';

        if ($isHours) {
            $urgencia = '⏳ ALERTA DE ÚLTIMA HORA';
            $cuerpo = "Faltan exactamente **{$this->diasRestantes} hora(s)** para que se cierre el plazo de entrega.";
        } else {
            $urgencia = match(true) {
                $this->diasRestantes === 0 => '🚨 HOY VENCE',
                $this->diasRestantes === 1 => '⚠️ MAÑANA VENCE',
                $this->diasRestantes <= 3  => '⏰ PRÓXIMO A VENCER',
                default                    => '📅 Recordatorio de Entrega',
            };

            $cuerpo = $this->diasRestantes === 0
                ? 'Hoy es el último día para entregar esta actividad.'
                : "Faltan **{$this->diasRestantes} día(s)** para que venza el plazo de esta actividad.";
        }

        $tipoLabel = $baseTipo === 'plan' ? 'Plan de Mejoramiento' : 'Tarea Institucional';
        $tab = $baseTipo === 'plan' ? 'plan' : 'tasks';
        $urlDestino = url("/profesor?tab={$tab}");

        return (new MailMessage)
            ->subject("{$urgencia}: {$this->actividad}")
            ->greeting("Hola " . ($notifiable->nombre ?? 'Profesor(a)') . ",")
            ->line("{$cuerpo}")
            ->line("**Tipo:** {$tipoLabel}")
            ->line("**Actividad:** {$this->actividad}")
            ->action('Ver mis actividades en la plataforma', $urlDestino)
            ->line('Por favor accede a la plataforma para entregar tu evidencia a tiempo.')
            ->salutation('Sistema de Mejoramiento Profesoral — Universidad Simón Bolívar');
    }

    public function toArray($notifiable): array
    {
        $isHours = str_ends_with($this->tipo, '_hours');
        $unidad = $isHours ? 'hora(s)' : 'día(s)';
        return [
            'actividad'      => $this->actividad,
            'dias_restantes' => $this->diasRestantes, // En realidad representa la cantidad (días u horas)
            'tipo'           => $this->tipo,
            'message'        => "Faltan {$this->diasRestantes} {$unidad} para vencer: {$this->actividad}",
        ];
    }
}
