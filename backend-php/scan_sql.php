<?php
$sqlFile = "c:\\Users\\darwin roa\\restrutura\\bdUnisimon.sql";
if (!file_exists($sqlFile)) {
    die("No existe el archivo SQL\n");
}

$content = file_get_contents($sqlFile);

function countValues($tableName, $content) {
    $pattern = '/INSERT INTO `' . preg_quote($tableName, '/') . '`[^;]*VALUES\s*(.+?);/is';
    if (preg_match($pattern, $content, $matches)) {
        $valuesBlock = $matches[1];
        preg_match_all('/\)\s*(?:,|\s*$)/', $valuesBlock, $valueMatches);
        return count($valueMatches[0]);
    }
    return 0;
}

$tables = [
    'actividades_plan',
    'asistencia_registro',
    'categorias_plan',
    'empresa',
    'encuentro',
    'estudiante',
    'periodo',
    'practica',
    'programa',
    'semana_practica',
    'tutor_academico',
    'tutor_empresarial',
    'usuarios'
];

echo "=== FILAS REALES EN bdUnisimon.sql ===\n";
foreach ($tables as $t) {
    $rows = countValues($t, $content);
    echo "- $t: $rows filas\n";
}
