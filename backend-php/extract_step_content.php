<?php
$subagentId = 'd3ceab0f-f3e9-40a3-8557-4bfbee5e5c71';
$logFile = "C:\\Users\\darwin roa\\.gemini\\antigravity\\brain\\{$subagentId}\\.system_generated\\logs\\transcript.jsonl";

if (!file_exists($logFile)) {
    die("No existe el log del subagent en: $logFile\n");
}

$lines = file($logFile);
foreach ($lines as $lineNum => $line) {
    $data = json_decode($line, true);
    if (isset($data['type']) && $data['type'] === 'VIEW_FILE' && strpos($data['content'], 'task.controller.js') !== false) {
        echo "=== VIEW_FILE in line $lineNum ===\n";
        // Guardar el contenido en un archivo para verlo completo sin truncar en la salida de consola
        file_put_contents("c:\\Users\\darwin roa\\restrutura\\backend-php\\original_task_controller.js", $data['content']);
        echo "Saved to original_task_controller.js successfully.\n";
        break;
    }
}
