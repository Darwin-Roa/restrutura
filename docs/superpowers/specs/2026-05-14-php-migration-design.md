# Migración a PHP y Nuevos Ajustes - Design Spec

## Goal
Migrar el backend actual de Node.js a PHP implementando nuevos ajustes solicitados (roles granulares, arreglos en usuarios, cursos y autoevaluación) sin afectar el sistema actual en producción.

## Architecture & Migration Strategy
1. **Directorio Aislado:** Todo el nuevo desarrollo se realizará en una nueva carpeta `backend-php` en la raíz del proyecto. El backend actual en Node.js (`backend/`) se mantendrá intacto para asegurar cero riesgos.
2. **Framework:** Se utilizará el framework **Laravel** (PHP). Es el estándar de la industria, muy seguro y su estructura (Modelos, Vistas, Controladores) es casi idéntica a la que ya tienes en Node.js, lo que hará la migración más limpia.
3. **Base de Datos:** El nuevo backend se conectará a la misma base de datos relacional actual, compartiendo la información pero con nuevas lógicas.
4. **Transición:** El frontend apuntará al servidor actual hasta que Laravel esté 100% finalizado. Luego solo cambiaremos la URL en la configuración.

## Components & New Features

### 1. Sistema de Roles y Permisos Granulares
- **Problema actual:** Los roles son rígidos.
- **Solución:** Implementar un esquema de permisos en Laravel (ej. con spatie/laravel-permission o tablas propias). El administrador podrá asignar permisos específicos como `can_generate_plan`, `can_evaluate`, `can_view_tracking` a profesores individuales.

### 2. Corrección en Creación de Usuarios
- **Problema actual:** Al crear un usuario, el departamento no se guarda y requiere una edición posterior manual.
- **Solución:** En el nuevo endpoint `POST /api/users` de Laravel, se validará y forzará la asignación del `department_id` desde el Request inicial.

### 3. Asignación de Cursos y Alertas
- **Requisito:** Los cursos deben tener un profesor asignado, ser visibles para el admin, y generar alerta si falta el docente en la vista de planes.
- **Solución:** 
  - Validar la clave foránea entre Cursos y Profesores en los Modelos de Laravel.
  - Al cargar los planes, el backend inyectará un flag `missing_teacher: true` si el curso relacionado no tiene profesor. El frontend leerá este flag para renderizar la alerta visual.

### 4. Autoevaluación del Profesor (Excluida de IA)
- **Requisito:** El profesor puede autoevaluarse. Debe quedar registrado en sistema pero ignorado en el análisis de la Inteligencia Artificial.
- **Solución:**
  - Crear un endpoint para que los profesores envíen su autoevaluación.
  - Al generar el string/contexto de datos que se envía a Gemini/Claude para armar los planes institucionales, se añadirá un filtro explícito en la consulta a la base de datos para omitir las autoevaluaciones.
