<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class EvidenciaSubidaMail extends Mailable
{
    use Queueable, SerializesModels;

    public User   $profesor;
    public string $nombreActividad;
    public string $nombreDepartamento;

    public function __construct(User $profesor, string $nombreActividad, string $nombreDepartamento)
    {
        $this->profesor           = $profesor;
        $this->nombreActividad    = $nombreActividad;
        $this->nombreDepartamento = $nombreDepartamento;
    }

    public function build(): self
    {
        return $this
            ->subject("📎 Nueva evidencia subida — {$this->nombreDepartamento}")
            ->html($this->renderHtml());
    }

    private function renderHtml(): string
    {
        $nombre     = htmlspecialchars($this->profesor->nombre ?? $this->profesor->name);
        $actividad  = htmlspecialchars($this->nombreActividad);
        $depto      = htmlspecialchars($this->nombreDepartamento);
        $correo     = htmlspecialchars($this->profesor->email);
        $url        = config('app.url');

        return <<<HTML
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><style>
  body { font-family: Arial, sans-serif; background: #f4f6f8; margin: 0; padding: 20px; }
  .card { background: #fff; border-radius: 12px; max-width: 560px; margin: 0 auto; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
  h2 { color: #0C447C; margin-top: 0; }
  .badge { display: inline-block; background: #e6f4ec; color: #09843B; font-weight: bold;
           padding: 4px 12px; border-radius: 99px; font-size: 12px; margin-bottom: 16px; }
  .field { margin: 8px 0; font-size: 14px; color: #374151; }
  .field strong { color: #0C447C; }
  .btn { display: inline-block; margin-top: 24px; background: #0C447C; color: #fff;
         padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; }
  .footer { margin-top: 32px; font-size: 11px; color: #9ca3af; text-align: center; }
</style></head>
<body>
  <div class="card">
    <span class="badge">📎 Nueva Evidencia Recibida</span>
    <h2>Departamento de {$depto}</h2>
    <p style="color:#6b7280;font-size:14px;">Un docente ha subido una nueva evidencia que requiere tu revisión.</p>
    <div class="field"><strong>Docente:</strong> {$nombre} ({$correo})</div>
    <div class="field"><strong>Actividad:</strong> {$actividad}</div>
    <div class="field"><strong>Departamento:</strong> {$depto}</div>
    <a href="{$url}/director/evidencias" class="btn">Revisar en la plataforma →</a>
    <div class="footer">Sistema de Mejoramiento Profesoral · Universidad Simón Bolívar</div>
  </div>
</body>
</html>
HTML;
    }
}
