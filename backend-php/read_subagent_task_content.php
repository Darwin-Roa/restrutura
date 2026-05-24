<?php
$subagentId = 'd3ceab0f-f3e9-40a3-8557-4bfbee5e5c71';
$logFile = "C:\\Users\\darwin roa\\.gemini\\antigravity\\brain\\{$subagentId}\\.system_generated\\logs\\transcript.jsonl";

if (!file_exists($logFile)) {
    die("No existe el log del subagent en: $logFile\n");
}

$lines = file($logFile);
foreach ($lines as $lineNum => $line) {
    $data = json_decode($line, true);
    if (isset($data['content']) && strpos($data['content'], 'getTasks =') !== false) {
        echo "=== Line $lineNum has getTasks ===\n";
        echo substr($data['content'], strpos($data['content'], 'getTasks ='), 1000) . "\n\n";
    }
}
