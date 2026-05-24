<?php
$subagentId = 'd3ceab0f-f3e9-40a3-8557-4bfbee5e5c71';
$logFile = "C:\\Users\\darwin roa\\.gemini\\antigravity\\brain\\{$subagentId}\\.system_generated\\logs\\transcript.jsonl";

if (!file_exists($logFile)) {
    die("No existe el log del subagent en: $logFile\n");
}

$lines = file($logFile);
foreach ($lines as $line) {
    $data = json_decode($line, true);
    // Buscamos si es un mensaje final o un response que contenga resúmenes de controladores de tareas
    if (isset($data['content']) && (strpos($data['content'], 'task') !== false || strpos($data['content'], 'fixed') !== false)) {
        echo "=== STEP INDEX: " . $data['step_index'] . " ===\n";
        echo substr($data['content'], 0, 1000) . "...\n\n";
    }
}
