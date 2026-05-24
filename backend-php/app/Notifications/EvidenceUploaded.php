<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EvidenceUploaded extends Notification
{
    use Queueable;

    protected $evidence;
    protected $teacher;
    protected $taskName;

    public function __construct($evidence, $teacher, $taskName)
    {
        $this->evidence = $evidence;
        $this->teacher = $teacher;
        $this->taskName = $taskName;
    }

    public function via($notifiable)
    {
        return ['database', 'mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
                    ->subject('Nueva evidencia subida: ' . $this->teacher->name)
                    ->greeting('Hola ' . $notifiable->name . ',')
                    ->line('El profesor ' . $this->teacher->name . ' ha subido una nueva evidencia para su revisión.')
                    ->line('Actividad: ' . $this->taskName)
                    ->action('Revisar en plataforma', url('/director/bandeja-evidencias'))
                    ->line('Gracias por usar nuestro sistema de seguimiento.');
    }

    public function toArray($notifiable)
    {
        return [
            'evidence_id' => $this->evidence->id,
            'teacher_name' => $this->teacher->name,
            'task_name' => $this->taskName,
            'message' => $this->teacher->name . ' ha subido evidencia para: ' . $this->taskName,
        ];
    }
}
