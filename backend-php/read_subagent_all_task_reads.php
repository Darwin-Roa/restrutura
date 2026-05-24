<?php
$subagentId = 'd3ceab0f-f3e9-40a3-8557-4bfbee5e5c71';
$logFile = "C:\\Users\\darwin roa\\.gemini\\antigravity\\brain\\{$subagentId}\\.system_generated\\logs\\transcript.jsonl";

if (!file_exists($logFile)) {
    die("No existe el log del subagent en: $logFile\n");
}

$lines = file($logFile);
foreach ($lines as $lineNum => $line) {
    $data = json_decode($line, true);
    if (isset($data['tool_calls'])) {
        foreach ($data['tool_calls'] as $tc) {
            if ($tc['name'] === 'view_file' || (isset($tc['arguments']['AbsolutePath']) && strpos($tc['arguments']['AbsolutePath'], 'task.controller.js') !== false)) {
                echo "=== Step $lineNum: Tool Call ===\n";
                print_r($tc);
            }
        }
    }
}
