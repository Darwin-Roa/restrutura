# 📖 MANUAL TÉCNICO Y DE USUARIO — SISTEMA DE GESTIÓN DE PLANES DE MEJORA PROFESORAL CON IA
## Universidad Simón Bolívar · Facultad de Ingeniería de Sistemas · Sede Cúcuta
### Versión 2.0 — Documentación Abismal y a Prueba de Tontos

> **Este documento es la fuente de verdad absoluta del sistema.** Cada dato aquí consignado ha sido extraído directamente del código fuente. Si algo aquí dice que un campo se llama `score_students`, así se llama en la base de datos, en el backend y en el frontend.

---

## 📋 TABLA DE CONTENIDOS

1. [Visión General del Sistema](#1-visión-general-del-sistema)
2. [Arquitectura Técnica](#2-arquitectura-técnica)
3. [Esquema de Base de Datos](#3-esquema-de-base-de-datos)
4. [API REST — Referencia Completa de Endpoints](#4-api-rest--referencia-completa-de-endpoints)
5. [Sistema de Autenticación JWT](#5-sistema-de-autenticación-jwt)
6. [Sistema de Roles y Permisos](#6-sistema-de-roles-y-permisos)
7. [Módulo 1: Página de Login](#7-módulo-1-página-de-login)
8. [Módulo 2: Administrador](#8-módulo-2-administrador)
9. [Módulo 3: Director / Coordinador](#9-módulo-3-director--coordinador)
10. [Módulo 4: Profesor](#10-módulo-4-profesor)
11. [Motor de Inteligencia Artificial (Google Gemini)](#11-motor-de-inteligencia-artificial-google-gemini)
12. [Lógica de Carry-Over (Arrastre de Tareas)](#12-lógica-de-carry-over-arrastre-de-tareas)
13. [Sistema de Exportación](#13-sistema-de-exportación)
14. [Sistema de Notificaciones](#14-sistema-de-notificaciones)
15. [Guía de Instalación y Configuración del Servidor](#15-guía-de-instalación-y-configuración-del-servidor)
16. [Flujos de Trabajo Completos (End-to-End)](#16-flujos-de-trabajo-completos-end-to-end)
17. [Glosario Técnico](#17-glosario-técnico)
18. [FAQ y Troubleshooting](#18-faq-y-troubleshooting)

---

## 1. VISIÓN GENERAL DEL SISTEMA

### ¿Qué es este sistema?

El **Sistema de Gestión de Planes de Mejora Profesoral** es una plataforma web institucional construida para la Universidad Simón Bolívar (sede Cúcuta, Facultad de Ingeniería de Sistemas) que automatiza y digitaliza el ciclo completo de evaluación y mejora del desempeño docente.

### ¿Qué problema resuelve?

Antes de este sistema, los directores de programa debían:
1. Evaluar manualmente a decenas de profesores cada semestre
2. Redactar a mano planes de mejora individuales (proceso de horas por docente)
3. Hacer seguimiento informal por email o en papel
4. No tener visibilidad histórica del progreso docente

### ¿Cómo lo resuelve?

El sistema usa **Google Gemini (IA)** para generar automáticamente planes de mejora personalizados basados en las evaluaciones ingresadas, luego permite al director revisar, editar y aprobar esos planes, y finalmente permite al profesor ver sus tareas y subir evidencias de cumplimiento.

### El Ciclo Completo en 7 Pasos

```
[ADMIN]         1. Configura el sistema (periodos, áreas, usuarios)
[ADMIN]         2. Abre un periodo académico → clona tareas institucionales
[DIRECTOR]      3. Ingresa evaluaciones de cada docente (notas + comentarios)
[DIRECTOR+IA]   4. Genera planes de mejora masivos con Google Gemini
[DIRECTOR]      5. Revisa, edita y aprueba los borradores de la IA
[PROFESOR]      6. Ve sus tareas y sube evidencias de cumplimiento
[DIRECTOR]      7. Aprueba o rechaza evidencias → ciclo se repite
```

### Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend | React + Vite | 18.x |
| Routing | React Router DOM | 6.x |
| Iconos | Lucide React | latest |
| Backend | Laravel (PHP) | 10.x |
| Base de Datos | MySQL | 8.x |
| Autenticación | JWT (firebase/php-jwt) | HS256 |
| IA | Google Gemini API | gemini-1.5-pro |
| PDF Export | barryvdh/laravel-dompdf | latest |
| Excel | shuchkin/simplexlsx | latest |
| CSS | TailwindCSS | 3.x |

---

## 2. ARQUITECTURA TÉCNICA

### Estructura de Carpetas del Proyecto

```
restrutura/
├── frontend/                          # Aplicación React
│   └── src/
│       ├── App.jsx                    # Router principal (rutas protegidas)
│       ├── main.jsx                   # Entry point (ReactDOM.createRoot)
│       ├── api/
│       │   └── axios.js              # Instancia Axios con baseURL + JWT interceptor
│       ├── context/
│       │   └── AuthContext.jsx       # Contexto global de autenticación
│       ├── hooks/
│       │   └── useAuth.js            # Hook para acceder al AuthContext
│       ├── components/
│       │   └── layout/
│       │       ├── AdminLayout.jsx   # Shell de navegación del Administrador
│       │       ├── DirectorLayout.jsx # Shell de navegación del Director
│       │       └── ProtectedRoute.jsx # Guardia de rutas por rol
│       └── pages/
│           ├── Login.jsx             # Página de acceso
│           ├── admin/                # 7 pantallas del Administrador
│           ├── director/             # 9 pantallas del Director
│           └── profesor/             # 1 pantalla del Profesor
│
└── backend-php/                       # API Laravel (PHP)
    ├── routes/
    │   └── api.php                   # 60+ endpoints REST
    ├── app/
    │   ├── Http/
    │   │   ├── Controllers/          # 17 controladores
    │   │   └── Middleware/           # jwt.auth, role
    │   ├── Models/                   # 16 modelos Eloquent
    │   └── Services/
    │       ├── AIService.php         # Integración Google Gemini
    │       └── ExportService.php     # Generación HTML/PDF
    └── database/
        └── migrations/               # Migraciones de la BD
```

### Flujo de una Petición Típica

```
USUARIO HACE CLIC EN BOTÓN
        ↓
React llama a api/axios.js (fetch)
        ↓
Axios agrega header: Authorization: Bearer {JWT_TOKEN}
        ↓
Laravel recibe la petición en routes/api.php
        ↓
Middleware jwt.auth verifica el token y extrae el usuario
        ↓
Middleware role:admin,director verifica que el rol sea permitido
        ↓
Controlador ejecuta la lógica de negocio
        ↓
Controlador retorna JSON: { success: true, data: {...} }
        ↓
React actualiza el estado (useState) y re-renderiza el componente
```

### Enrutamiento del Frontend

El archivo `App.jsx` define todas las rutas con protección:

```
/login                → Login.jsx                   (pública)
/admin                → AdminDashboard.jsx           (solo admin)
/admin/usuarios       → UserManagement.jsx           (solo admin)
/admin/roles          → RoleManagement.jsx           (solo admin)
/admin/cursos         → CourseManagement.jsx         (solo admin)
/admin/periodos       → PeriodManagement.jsx         (solo admin)
/admin/areas          → AreaManagement.jsx           (solo admin)
/admin/departamentos  → DepartmentManagement.jsx     (solo admin)
/director             → DirectorDashboard.jsx        (solo MANAGEMENT)
/director/evaluar     → EvaluationEntry.jsx          (solo MANAGEMENT)
/director/generar     → GeneratePlan.jsx             (solo MANAGEMENT)
/director/planes      → PlanesMejora.jsx             (solo MANAGEMENT)
/director/historial   → HistorialEvolucion.jsx       (solo MANAGEMENT)
/director/tareas      → PlanTrabajo.jsx              (solo MANAGEMENT)
/director/cursos      → GestionCursos.jsx            (solo MANAGEMENT)
/director/evidencias  → BandejaEvidencias.jsx        (solo MANAGEMENT)
/director/exportar    → ExportarDirector.jsx         (solo MANAGEMENT)
/profesor             → ProfesorDashboard.jsx        (solo profesor)
```

> **Importante:** El rol del director en el sistema se llama técnicamente `MANAGEMENT` (no `director`). El sistema distingue entre `admin` (minúsculas), `profesor` (minúsculas) y `MANAGEMENT` (mayúsculas). Esto es fundamental para la lógica de redirección.

---

## 3. ESQUEMA DE BASE DE DATOS

### Tabla `usuarios` (Modelo: User.php)

La tabla se llama `usuarios` (no `users`) porque el sistema fue migrado desde una base de datos anterior. El modelo tiene alias de compatibilidad.

| Columna | Tipo | Descripción | Notas |
|---------|------|-------------|-------|
| `id` | INT PK | Identificador auto-incremental | |
| `nombre` | VARCHAR | Nombre completo del usuario | Accedido como `name` gracias al accessor de Eloquent |
| `email` | VARCHAR UNIQUE | Correo institucional | Usado para login |
| `cedula` | INT | Cédula de identidad | Cast a integer |
| `password` | VARCHAR | Contraseña hasheada con bcrypt | Oculta en respuestas JSON |
| `role` | VARCHAR | Rol del sistema | Valores: `admin`, `profesor`, `MANAGEMENT` |
| `programa_id` | INT FK | Referencia al departamento/programa | FK a tabla `programas` |
| `is_active` | BOOLEAN | Si la cuenta está activa | Cast a boolean |
| `signature_path` | VARCHAR | Ruta al archivo de firma digital | Para PDFs firmados |
| `creado_en` | TIMESTAMP | Fecha de creación | Alias de `created_at` |
| `updatedAt` | TIMESTAMP | Fecha de última modificación | |
| `deletedAt` | TIMESTAMP NULL | Soft delete | NULL = activo |

**Relaciones:**
- `belongsTo Programa` → via `programa_id`
- `belongsToMany Permission` → via tabla `user_has_permissions`

### Tabla `periodos` (Modelo: Period.php)

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | INT PK | |
| `name` | VARCHAR | Ej: `2026-1`, `2026-2` |
| `start_date` | DATE | Fecha de inicio del semestre |
| `end_date` | DATE | Fecha de cierre del semestre |
| `is_active` | BOOLEAN | Solo 1 periodo puede estar activo a la vez |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

### Tabla `evaluaciones` (Modelo: Evaluation.php)

| Columna | Tipo | Descripción | Rango |
|---------|------|-------------|-------|
| `id` | INT PK | | |
| `teacher_id` | INT FK | Referencia al profesor evaluado | → usuarios |
| `period_id` | INT FK | Periodo de la evaluación | → periodos |
| `course_id` | INT FK NULL | Curso evaluado (puede ser null) | → cursos |
| `score_students` | DECIMAL(4,2) | Nota de autoevaluación de estudiantes | 0.0 a 5.0 |
| `score_director` | DECIMAL(4,2) | Nota asignada por el director | 0.0 a 5.0 |
| `score_self` | DECIMAL(4,2) | Nota de autoevaluación del docente | 0.0 a 5.0 |
| `score_total` | DECIMAL(4,2) | Promedio automático: (s1+s2+s3)/3 | 0.0 a 5.0 |
| `director_notes` | TEXT | Comentarios cualitativos del director | Texto libre |
| `student_rep_comments` | TEXT | Comentarios del representante estudiantil | Texto libre |
| `created_by` | INT FK | ID del director que creó la evaluación | → usuarios |
| `created_at` | TIMESTAMP | | |

### Tabla `improvement_plans` (Modelo: ImprovementPlan.php)

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | INT PK | |
| `teacher_id` | INT FK | Profesor al que pertenece el plan |
| `period_id` | INT FK | Periodo del plan |
| `evaluation_id` | INT FK NULL | Evaluación que originó el plan |
| `status` | VARCHAR | `ai_generated`, `approved`, `rejected` |
| `diagnosis_text` | TEXT | Diagnóstico narrativo generado por la IA |
| `strengths` | JSON | Array de fortalezas identificadas |
| `improvement_opps` | JSON | Array de oportunidades de mejora |
| `objectives` | JSON | Array de objetivos del plan |
| `consolidated_comments` | JSON | Comentarios consolidados de la IA |
| `work_plan` | JSON | Plan de trabajo detallado |
| `history_analysis` | TEXT | Análisis histórico comparativo |
| `ai_generated_at` | DATETIME | Cuándo generó la IA el plan |
| `ai_prompt_context` | TEXT | Contexto enviado a Gemini |
| `director_feedback` | TEXT NULL | Retroalimentación del director |
| `reviewed_at` | DATETIME NULL | Cuándo fue revisado |
| `reviewed_by` | INT FK NULL | Quién lo revisó |
| `approved_at` | DATETIME NULL | Cuándo fue aprobado |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

**Estados del Plan:**
- `ai_generated` → Generado por la IA, **invisible para el profesor**
- `approved` → Aprobado por el director, **visible y activo para el profesor**
- `rejected` → Rechazado, el director puede eliminarlo

### Tabla `plan_actions` (Modelo: PlanAction.php)

Cada fila es una tarea específica dentro de un plan de mejora.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | INT PK | |
| `plan_id` | INT FK | Plan al que pertenece |
| `order_num` | INT | Número de orden de la tarea |
| `aspect` | VARCHAR | Área de gestión (ej: "TIC", "Pedagogía") |
| `concrete_action` | TEXT | Descripción detallada de qué debe hacer el docente |
| `verifiable_product` | TEXT | Qué debe entregar como evidencia (ej: "Certificado PDF") |
| `expected_goal` | TEXT | Resultado esperado al completar la tarea |
| `deadline` | DATE | Fecha límite de entrega |
| `status` | VARCHAR | `pending`, `in_progress`, `completed`, `verified`, `rejected`, `not_delivered` |
| `carry_over_count` | INT | Cuántas veces ha sido arrastrada de periodos anteriores |
| `needs_carry_over` | BOOLEAN | Marcador interno para el proceso de arrastre |
| `course_id` | INT FK NULL | Curso asociado si aplica |
| `created_at` | TIMESTAMP | |
| `updated_at` | TIMESTAMP | |

**Estados de la Tarea (PlanAction):**

| Estado | Quién lo asigna | Significado |
|--------|----------------|-------------|
| `pending` | Sistema | El profesor no ha subido nada |
| `in_progress` | Sistema | En proceso |
| `completed` | Sistema (al subir evidencia) | Evidencia subida, esperando revisión |
| `verified` | Director | Aprobada por el director |
| `rejected` | Director | Rechazada por el director |
| `not_delivered` | Sistema (al abrir periodo) | No entregó en el periodo anterior |

### Tabla `evidences` (Modelo: Evidence.php)

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | INT PK | |
| `file_name` | VARCHAR | Nombre original del archivo subido |
| `file_path` | VARCHAR | Ruta en el servidor: `uploads/{nombre}` |
| `file_type` | VARCHAR(50) | MIME type del archivo (ej: `application/pdf`) |
| `file_size` | INT | Tamaño en bytes |
| `teacher_id` | INT FK | Profesor que subió la evidencia |
| `period_id` | INT FK NULL | Periodo activo al momento de subir |
| `task_assignment_id` | INT FK NULL | Si es para una tarea institucional |
| `plan_action_id` | INT FK NULL | Si es para una acción del plan de mejora |
| `verified` | BOOLEAN NULL | NULL = pendiente, TRUE = aprobada, FALSE = rechazada |
| `verified_at` | DATETIME NULL | Cuándo fue revisada |
| `verified_by` | INT FK NULL | Quién la revisó |
| `created_at` | TIMESTAMP | |

### Tabla `fixed_tasks` (Modelo: FixedTask.php)

Tareas institucionales fijas que se asignan a todos los profesores automáticamente.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | INT PK | |
| `activity` | TEXT | Descripción de la actividad |
| `period_id` | INT FK | Periodo al que pertenece |
| `management_area` | VARCHAR | Área de gestión |
| `scope` | VARCHAR | `global`, `individual`, `por_curso` |
| `specific_teacher_id` | INT FK NULL | Solo si scope = `individual` |
| `is_active` | BOOLEAN | Si está activa |

### Tabla `task_assignments` (Modelo: TaskAssignment.php)

Asignaciones individuales de tareas institucionales a profesores.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | INT PK | |
| `fixed_task_id` | INT FK | Tarea base |
| `teacher_id` | INT FK | Profesor asignado |
| `period_id` | INT FK | Periodo |
| `course_id` | INT FK NULL | Curso (si scope = por_curso) |
| `status` | VARCHAR | `pending`, `completed`, `verified`, `rejected` |
| `teacher_response` | TEXT NULL | Respuesta del profesor al completar |
| `completed_at` | DATETIME NULL | Cuándo la marcó como completada |
| `createdAt` | TIMESTAMP | |
| `updatedAt` | TIMESTAMP | |

### Tabla `roles` (Modelo: Role.php)

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | INT PK | |
| `name` | VARCHAR | Nombre del rol (ej: `director`) |
| `permissions` | JSON | Array de claves de permiso |
| `created_at` | TIMESTAMP | |

### Tabla `programas` (Modelo: Programa.php)

Equivale a departamentos/programas académicos.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | INT PK | |
| `nombre` | VARCHAR | Nombre del programa (ej: "Ingeniería de Sistemas") |
| `created_at` | TIMESTAMP | |

---

## 4. API REST — REFERENCIA COMPLETA DE ENDPOINTS

### URL Base

```
http://localhost:8000/api
```

En producción esto cambia según la configuración del servidor Apache/Nginx.

### Convenciones de Respuesta

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Respuesta de error:**
```json
{
  "success": false,
  "error": "Mensaje de error descriptivo"
}
```

**Respuesta de autenticación fallida (401):**
```json
{
  "message": "Credenciales inválidas o usuario inactivo"
}
```

---

### 4.1 Endpoints Públicos (Sin autenticación)

#### `POST /api/auth/login`
Login del usuario. El único endpoint que NO requiere JWT.

**Request Body:**
```json
{
  "email": "admin@unisimon.edu.co",
  "password": "mi_contraseña"
}
```

**Response exitosa (200):**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGci...",
  "user": {
    "id": 1,
    "name": "Carlos Ramírez",
    "role": "admin",
    "programa_id": null,
    "permissions": ["ver_dashboard", "subir_evaluacion", ...]
  }
}
```

**Response error (401):**
```json
{
  "message": "Credenciales inválidas o usuario inactivo"
}
```

**Comportamiento especial:** Si el campo `is_active` del usuario es `false`, el login falla aunque la contraseña sea correcta. Esto protege contra cuentas suspendidas.

---

#### `GET /api/departments`
Lista todos los departamentos/programas. Pública para que el formulario de registro pueda mostrar el desplegable.

**Response:**
```json
{
  "success": true,
  "departments": [
    { "id": 1, "nombre": "Ingeniería de Sistemas" },
    { "id": 2, "nombre": "Ingeniería Civil" }
  ]
}
```

---

#### `GET /api/roles`
Lista todos los roles configurados.

---

#### `GET /api/periods`
Lista todos los periodos académicos registrados.

**Response:**
```json
{
  "success": true,
  "periods": [
    { "id": 1, "name": "2026-1", "start_date": "2026-01-15", "end_date": "2026-06-30", "is_active": true },
    { "id": 2, "name": "2025-2", "start_date": "2025-07-15", "end_date": "2025-12-15", "is_active": false }
  ]
}
```

---

#### `GET /api/areas`
Lista todas las áreas de gestión.

---

### 4.2 Endpoints Protegidos (Requieren JWT)

Todos requieren el header: `Authorization: Bearer {token}`

---

#### `GET /api/auth/me`
Obtiene el perfil del usuario autenticado con sus permisos actualizados.

**Uso:** El frontend llama este endpoint al cargar la aplicación para verificar si el token sigue vigente y obtener los datos del usuario.

---

#### `GET /api/users`
Lista todos los usuarios. Accesible por todos los roles autenticados.

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": 5,
      "name": "María García",
      "nombre": "María García",
      "email": "maria.garcia@unisimon.edu.co",
      "cedula": 1234567890,
      "role": "profesor",
      "programa_id": 1,
      "is_active": true,
      "department": "Ingeniería de Sistemas"
    }
  ]
}
```

---

#### `POST /api/users` ⚠️ Solo admin
Crea un nuevo usuario.

**Request Body:**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan.perez@unisimon.edu.co",
  "cedula": 9876543210,
  "password": "contraseña_temporal",
  "role": "profesor",
  "programa_id": 1,
  "is_active": true
}
```

---

#### `PUT /api/users/{id}` ⚠️ Solo admin
Actualiza datos de un usuario existente.

---

#### `DELETE /api/users/{id}` ⚠️ Solo admin
Elimina/desactiva un usuario.

---

#### `GET /api/courses`
Lista todos los cursos. Incluye el departamento asociado.

---

#### `POST /api/courses` ⚠️ Solo admin o director
Crea un nuevo curso.

**Request Body:**
```json
{
  "name": "Base de Datos I",
  "code": "IS-402",
  "programa_id": 1
}
```

---

#### `POST /api/courses/assign` ⚠️ Solo admin o director
Asigna un profesor a un curso en un periodo específico.

**Request Body:**
```json
{
  "teacher_id": 5,
  "course_id": 3,
  "period_id": 1
}
```

---

#### `POST /api/periods` ⚠️ Solo admin
Crea un nuevo periodo académico en estado cerrado.

**Request Body:**
```json
{
  "name": "2026-2",
  "start_date": "2026-07-15",
  "end_date": "2026-12-15",
  "is_active": false
}
```

---

#### `PUT /api/periods/{id}` ⚠️ Solo admin
Actualiza nombre y fechas de un periodo.

---

#### `POST /api/periods/{id}/open` ⚠️ Solo admin o director
**Este es uno de los endpoints más críticos del sistema.**

Activa un periodo, cerrando todos los demás, ejecutando el carry-over de tareas y clonando las tareas institucionales.

**Request Body:** Vacío (solo autenticación)

**Response exitosa:**
```json
{
  "success": true,
  "message": "Periodo '2026-1' activado y 47 tareas clonadas."
}
```

**Lógica interna (ver sección 12 para detalle completo):**
1. Desactiva TODOS los periodos activos
2. Activa el periodo seleccionado
3. Busca tareas pendientes de periodos anteriores y las marca como `not_delivered`
4. Clona esas tareas al nuevo periodo con `carry_over_count + 1`
5. Obtiene todas las tareas institucionales del nuevo periodo
6. Asigna masivamente esas tareas a todos los profesores activos del programa
7. Lo hace en chunks de 500 registros para eficiencia

---

#### `POST /api/evaluations` ⚠️ Solo director o admin
Registra una evaluación de un docente.

**Request Body:**
```json
{
  "teacher_id": 5,
  "period_id": 1,
  "course_id": 3,
  "score_students": 4.2,
  "score_director": 3.8,
  "score_self": 4.5,
  "director_notes": "El docente presenta debilidades en el uso de plataformas virtuales...",
  "student_rep_comments": "Los estudiantes reportan puntualidad pero lentitud en calificar",
  "student_comments": ["Muy buen profesor", "Explica bien pero tarda en calificar"],
  "rep_comments": ["Excelente manejo del grupo"],
  "self_eval_comments": ["Necesito mejorar en herramientas digitales"]
}
```

**Comportamiento automático:** El backend calcula `score_total = round((score_students + score_director + score_self) / 3, 1)` y luego llama a Google Gemini para clasificar el sentimiento de cada comentario (`positivo`, `negativo`, `neutral`).

**Response exitosa (201):**
```json
{
  "success": true,
  "evaluation": {
    "id": 12,
    "teacher_id": 5,
    "period_id": 1,
    "score_total": 4.2,
    "studentComments": [
      { "id": 1, "comment_text": "Muy buen profesor", "sentiment": "positivo" }
    ]
  }
}
```

---

#### `POST /api/evaluations/mass-upload` ⚠️ Solo director o admin
Carga masiva de evaluaciones desde archivo CSV o XLSX.

**Request:** `multipart/form-data`
- Campo `file`: Archivo CSV o XLSX

**Formato del archivo CSV:**
```csv
Periodo,Email_Profesor,Nota_Estudiantes,Nota_Director,Auto_Nota,Notas_Director,Comentarios_Representantes,Comentarios_Estudiantes,Comentarios_Autoevaluacion
2026-1,maria.garcia@unisimon.edu.co,4.2,3.8,4.5,Buen desempeño,Buen profesor,Muy buen docente|Explica claro,Debo mejorar en TIC
```

**Separador de comentarios múltiples:** El carácter `|` (pipe) dentro de la celda.

**Restricción:** Solo se procesan filas cuyo periodo coincide con el periodo activo.

---

#### `GET /api/plans`
Lista todos los planes de mejora. Filtra automáticamente por programa del director.

**Comportamiento por rol:**
- `admin`: Ve todos los planes de todos los profesores
- `MANAGEMENT` (director): Solo ve los planes de profesores de su `programa_id`
- `profesor`: No debería llamar este endpoint; usa `/plans/my-plan`

---

#### `GET /api/plans/my-plan` ⚠️ Solo profesor/admin/director
Obtiene el plan de mejora **aprobado** del periodo activo para el usuario autenticado.

**Incluye también las acciones de deuda** (carry-over) de periodos anteriores, marcadas con `is_debt: true`.

**Response:**
```json
{
  "success": true,
  "plan": {
    "id": 7,
    "status": "approved",
    "diagnosis_text": "El docente...",
    "PlanActions": [
      {
        "id": 14,
        "aspect": "TIC",
        "concrete_action": "Completar curso de Moodle",
        "verifiable_product": "Certificado de finalización",
        "deadline": "2026-04-30",
        "status": "pending",
        "carry_over_count": 0,
        "is_debt": false
      },
      {
        "id": 8,
        "aspect": "Investigación",
        "concrete_action": "Publicar artículo científico",
        "carry_over_count": 1,
        "is_debt": true
      }
    ]
  }
}
```

---

#### `POST /api/plans/generate` ⚠️ Solo admin/director
Genera un plan de mejora para un profesor individual usando Google Gemini.

**Request Body:**
```json
{
  "teacher_id": 5,
  "period_id": 1
}
```

**Response:** El plan generado por la IA como JSON, **sin guardarlo todavía** en la base de datos. El director debe revisarlo y luego llamar a `/plans/save`.

---

#### `POST /api/plans/mass-generate` ⚠️ Solo admin/director
Genera planes para múltiples profesores en segundo plano.

**Request Body:**
```json
{
  "teacher_ids": [5, 8, 12, 15],
  "period_id": 1
}
```

**Response inmediata:**
```json
{
  "success": true,
  "jobId": "mass_6831a2b4f8c1d"
}
```

El `jobId` se usa para consultar el progreso.

---

#### `GET /api/plans/mass-status/{jobId}` ⚠️ Solo admin/director
Consulta el progreso de una generación masiva.

**Response:**
```json
{
  "success": true,
  "job": {
    "status": "processing",
    "total": 4,
    "completed": 2,
    "failed": 0,
    "current_teacher": "María García",
    "results": [
      { "teacher_id": 5, "status": "ok" },
      { "teacher_id": 8, "status": "ok" }
    ]
  }
}
```

Cuando `status === "completed"`, la generación terminó.

---

#### `POST /api/plans/save` ⚠️ Solo admin/director
Guarda o actualiza un plan en la base de datos.

**Request Body:**
```json
{
  "teacher_id": 5,
  "period_id": 1,
  "status": "ai_generated",
  "planData": {
    "diagnosis_text": "El docente...",
    "strengths": ["Metodología excelente"],
    "improvement_opps": ["Manejo de TIC"],
    "objectives": ["Mejorar uso de plataformas"],
    "actions": [
      {
        "aspect": "TIC",
        "concrete_action": "Completar curso Moodle",
        "verifiable_product": "Certificado PDF",
        "expected_goal": "Dominar la plataforma institucional",
        "deadline": "2026-04-30"
      }
    ]
  }
}
```

**Comportamiento:** Si ya existe un plan para ese `teacher_id` + `period_id`, lo actualiza (upsert). Si no existe, lo crea. Las fechas `deadline` se validan y ajustan automáticamente para que queden dentro del rango del periodo.

---

#### `PATCH /api/plans/{id}/status` ⚠️ Solo admin/director
Actualiza el estado de un plan (aprobar/rechazar).

**Request Body:**
```json
{
  "status": "approved",
  "director_feedback": "Plan revisado y aprobado con las modificaciones pertinentes"
}
```

Al pasar `status: "approved"`, el backend guarda automáticamente `approved_at = now()`.

---

#### `DELETE /api/plans/{id}` ⚠️ Solo admin/director
Elimina permanentemente un plan y todas sus acciones (NO hay papelera de reciclaje).

---

#### `POST /api/evidence` ⚠️ Cualquier usuario autenticado
Sube una evidencia de cumplimiento. Acepta `multipart/form-data`.

**Campos del formulario:**
- `file` (opcional): Archivo binario, máximo 20MB (`max:20480` kilobytes)
- `task_id` / `task_assignment_id` (opcional): ID de la asignación de tarea institucional
- `action_id` / `plan_action_id` (opcional): ID de la acción del plan de mejora
- `teacher_response` (opcional): Comentario del profesor

**Comportamiento:**
1. Guarda el archivo en `backend-php/public/uploads/{uniqid}_{nombre_original}`
2. Crea el registro en la tabla `evidences`
3. Actualiza el estado de la tarea/acción a `completed`
4. **Envía notificación push a todos los directores del mismo programa**

---

#### `PATCH /api/evidence/{id}/verify` ⚠️ Solo admin/director
Aprueba o rechaza una evidencia.

**Request Body:**
```json
{
  "is_approved": true,
  "teacher_response": "El certificado cumple con las horas requeridas"
}
```

**Comportamiento:**
- Si `is_approved: true`: 
  - `evidence.verified = true`
  - Tarea → status `verified`
- Si `is_approved: false`:
  - `evidence.verified = false`
  - Tarea → status `rejected`

---

#### `GET /api/evidence/pending` ⚠️ Solo admin/director
Lista evidencias pendientes de revisión (donde `verified IS NULL`).

**Query param opcional:** `?all=true` muestra también las ya revisadas.

---

#### `GET /api/export/plan/{planId}/pdf`
Descarga el plan en formato PDF membretado.

**Respuesta:** Archivo binario PDF con `Content-Disposition: attachment; filename="plan_mejora_{nombre_docente}.pdf"`.

---

#### `GET /api/export/global/csv`
Exporta todos los planes del programa en formato CSV.

**Columnas:** `ID, Docente, Periodo, Estado, Diagnóstico (primeros 200 chars), # Acciones`

---

#### `GET /api/export/global/excel-matriz`
Exporta la matriz de cumplimiento de tareas institucionales en formato `.xls`.

**Estructura:** Filas = tareas agrupadas por área, Columnas = profesores. Celda = `S` (cumplió) o `N` (no cumplió).

---

#### `GET /api/notifications`
Lista las notificaciones del usuario autenticado.

---

#### `PATCH /api/notifications/read-all`
Marca todas las notificaciones como leídas.

---

#### `PATCH /api/notifications/{id}/read`
Marca una notificación específica como leída.

---

## 5. SISTEMA DE AUTENTICACIÓN JWT

### Cómo Funciona

1. El usuario llama a `POST /api/auth/login` con email y password
2. El backend verifica: `is_active = true` y `Hash::check(password, hash)`
3. Si es correcto, genera un token JWT con este payload:

```json
{
  "id": 5,
  "name": "María García",
  "role": "profesor",
  "programa_id": 1,
  "iat": 1748275200,
  "exp": 1748304000
}
```

4. El token expira en `JWT_EXPIRES_IN` minutos (configurado en `.env`, por defecto 480 minutos = 8 horas)
5. El frontend guarda el token en `localStorage` (clave exacta: gestionado por `AuthContext`)
6. Cada petición incluye: `Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGci...`

### Dónde se Configura la Expiración

En `backend-php/.env`:
```env
JWT_SECRET=tu_clave_secreta_super_segura_aqui
JWT_EXPIRES_IN=480
```

### ¿Qué pasa si el token expira?

El servidor devuelve `401 Unauthorized`. El frontend debe interceptar esto y redirigir al login. El interceptor de Axios en `api/axios.js` maneja este caso.

---

## 6. SISTEMA DE ROLES Y PERMISOS

### Los 3 Roles del Sistema

| Rol | Valor exacto en BD | Accede a |
|-----|-------------------|----------|
| Administrador | `admin` | `/admin/*` |
| Director/Coordinador | `MANAGEMENT` | `/director/*` |
| Profesor | `profesor` | `/profesor` |

> **⚠️ IMPORTANTE:** El director/coordinador tiene el rol `MANAGEMENT` (en mayúsculas) en la base de datos. Si se crea un usuario con rol `director` (minúsculas), NO podrá acceder al módulo director. Debe ser exactamente `MANAGEMENT`.

### Catálogo Completo de Permisos

Los permisos se almacenan como un array JSON en la tabla `roles`. Estos son los permisos disponibles en el sistema:

| Clave del Permiso | Nombre Visible | Grupo |
|-------------------|---------------|-------|
| `seguimiento_general` | Seguimiento general | Módulos del Sistema |
| `subir_evaluacion` | Subir Evaluación | Módulos del Sistema |
| `copilot_ia` | Copilot IA → plan | Módulos del Sistema |
| `planes_mejora` | Planes de mejora | Módulos del Sistema |
| `auditoria_docente` | Auditoría Docente | Módulos del Sistema |
| `plan_trabajo` | Plan de trabajo | Módulos del Sistema |
| `gestion_cursos` | Gestión de Cursos | Módulos del Sistema |
| `bandeja_evidencias` | Bandeja de evidencias | Módulos del Sistema |
| `exportar` | Exportar | Módulos del Sistema |

### Permisos Automáticos del Rol `profesor`

El rol `profesor` siempre tiene estos permisos inyectados automáticamente en el `AuthController`, independientemente de lo que tenga configurado en la base de datos:

```php
private const BASE_PROFESOR_PERMS = [
    'ver_dashboard', 'ver_planes', 'plan_trabajo', 'bandeja_evidencias',
    'subir_evidencia', 'descargar_evidencia', 'ver_buenas_practicas'
];
```

### ¿Cómo se Asignan los Permisos al Rol `MANAGEMENT`?

El administrador va a `/admin/roles`, selecciona el rol `director` de la tabla, y puede marcar/desmarcar checkboxes de permisos. Los cambios se guardan inmediatamente vía `PUT /api/roles/{id}`.

El menú lateral de navegación del director se construye dinámicamente según qué permisos tenga habilitados.

---

## 7. MÓDULO 1: PÁGINA DE LOGIN

**Archivo:** [`Login.jsx`](file:///c:/Users/darwin%20roa/restrutura/frontend/src/pages/Login.jsx)  
**URL:** `/login`  
**Acceso:** Público (sin autenticación)

### Diseño Visual

La página tiene un diseño de **dos paneles** (split screen):
- **Izquierdo (5/12 del ancho):** Panel oscuro con gradiente `#0f2217 → #09843B` (verde oscuro al verde institucional). Solo visible en pantallas `lg` (≥1024px). En móvil, se oculta.
- **Derecho (7/12 del ancho):** Fondo blanco puro con el formulario.

El fondo general de la página es `#f0f7f3` (verde muy pálido).

### Panel Izquierdo — Detalle Completo

| Elemento | Descripción técnica |
|----------|---------------------|
| **Ícono Universidad** | `GraduationCap` de Lucide React, tamaño 22px, en contenedor `w-11 h-11 rounded-2xl` con fondo `rgba(255,255,255,0.1)` |
| **Texto "Universidad Simón Bolívar"** | Font-bold, 15px, color blanco, fuente del sistema |
| **Subtítulo "Ingeniería de Sistemas · Cúcuta"** | 11px, color `white/50` (50% de opacidad) |
| **Título "Portal de Mejora Profesoral"** | 2.6rem, bold, fuente `Playfair Display serif`, color blanco. "Mejora Profesoral" en verde `#86efac` |
| **Descripción** | "Plataforma institucional para el seguimiento, evaluación y mejora continua del cuerpo docente." 14px, `white/55` |
| **Feature Pill 1** | Ícono `LayoutDashboard` + texto "Seguimiento por periodo activo" |
| **Feature Pill 2** | Ícono `Bot` + texto "Copilot IA para planes de mejora" |
| **Feature Pill 3** | Ícono `CheckCircle2` + texto "Auditoría de evidencias docentes" |
| **Patrón decorativo** | `radial-gradient` con puntos blancos en opacidad 5%, tamaño 40x40px |

### Panel Derecho — Formulario de Acceso

#### Indicador "Acceso seguro"

- Ícono `ShieldCheck` (14px) en contenedor verde pálido `#e6f4ec`
- Texto "ACCESO SEGURO" en mayúsculas, 11px, tracking-widest, color `#09843B`

#### Campo 1: Email Institucional

```
Tipo:        email (HTML5)
Label:       "Email institucional"
Placeholder: "nombre@unisimon.edu.co"
Required:    Sí
Estado normal:  border: 1.5px solid #e5e7eb, background: #f9fafb
Estado focus:   border: 1.5px solid #09843B, background: #fff, 
                boxShadow: 0 0 0 3px rgba(9,132,59,0.08)
Estado blur:    Vuelve a normal
Validación:     Nativa del navegador (tipo email)
```

#### Campo 2: Contraseña

```
Tipo:       password (por defecto) / text (cuando se muestra)
Label:      "Contraseña"
Required:   Sí
Mismo estilo de focus/blur que el email
```

**Botón Ojo (toggle contraseña):**
- Posición: `absolute right-3 top-1/2 -translate-y-1/2`
- Ícono: `Eye` (cuando contraseña oculta) / `EyeOff` (cuando visible)
- Tamaño: 15px
- Color: `text-gray-400 hover:text-gray-600`
- Al hacer clic: `setShowPwd(prev => !prev)` → cambia el `type` del input

#### Botón "Ingresar a la plataforma"

```
Tipo:           submit
Estilo normal:  background: #09843B, boxShadow: 0 4px 12px rgba(9,132,59,0.28)
Estilo hover:   background: #066b2f (verde más oscuro)
Estilo loading: background: #9ca3af (gris), cursor: not-allowed, disabled: true
Ícono:          LogIn (16px) a la izquierda del texto
```

**Estados:**
- **Normal:** Texto "Ingresar a la plataforma" con ícono LogIn
- **Cargando:** Spinner animado (`animate-spin`, borde blanco al 30% + blanco completo) + texto "Verificando..."

#### Alerta de Error

Aparece cuando `error !== ''`. Es un `<div>` con:
```
background: #fef2f2
border:     1px solid #fecaca
color:      text-red-600
padding:    p-3
rounded:    rounded-xl
text-size:  text-xs font-medium
```

Contenido: `⚠ Credenciales incorrectas. Verifique su email y contraseña.`

#### Lógica de Autenticación Completa

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();          // Previene recarga de página
  setLoading(true);            // Activa spinner
  setError('');                // Limpia errores previos
  try {
    const loggedUser = await login(email, password);  // Llama AuthContext.login()
    navigate(`/${loggedUser.role}`);                  // Redirige según rol:
                                                      // admin → /admin
                                                      // profesor → /profesor
                                                      // MANAGEMENT → /director
  } catch {
    setError('Credenciales incorrectas...');         // Muestra alerta roja
  } finally {
    setLoading(false);          // Desactiva spinner siempre
  }
};
```

#### Redirección Automática

Si el usuario YA está autenticado y navega a `/login`, el componente hace:
```javascript
if (user) return <Navigate to={`/${user.role}`} />;
```
Es decir, redirige directamente a su módulo correspondiente sin mostrar el formulario.

#### Pie de Página

```
© 2026 Universidad Simón Bolívar
Facultad de Ingeniería · Sede Cúcuta
```
Texto centrado, 11px, color `text-gray-300`.

---

## 8. MÓDULO 2: ADMINISTRADOR

**Directorio:** [`pages/admin/`](file:///c:/Users/darwin%20roa/restrutura/frontend/src/pages/admin)  
**URL base:** `/admin`  
**Rol requerido:** `admin`  
**Layout:** `AdminLayout.jsx` (menú lateral fijo + área de contenido)

### 8.A Dashboard del Administrador

**Archivo:** [`AdminDashboard.jsx`](file:///c:/Users/darwin%20roa/restrutura/frontend/src/pages/admin/AdminDashboard.jsx)  
**URL:** `/admin` (índice del módulo)

#### ¿Qué carga al entrar?

Al montar el componente, hace llamadas paralelas a:
1. `GET /api/users` → Para calcular métricas de usuarios
2. `GET /api/periods` → Para mostrar periodo activo
3. `GET /api/departments` (o `/programas`) → Para conteo de departamentos
4. `GET /api/courses` → Para conteo de cursos

#### Tarjeta 1: "Salud del Sistema"

- **Valor mostrado:** `Math.round((usuariosActivos / usuariosTotal) * 100)%`
- **Subtexto:** "{N} usuarios operativos"
- **Ícono:** `Server` (Lucide), fondo verde
- **Estado crítico:** Si el porcentaje es < 50%, el número se muestra en rojo

#### Tarjeta 2: "Periodo Académico"

- **Valor mostrado:** Nombre del periodo con `is_active === true` (ej: `2026-1`)
- **Estado sin periodo activo:** El número se muestra en rojo con texto "Sin Configurar"
- **Subtexto:** "{N} periodos históricos" (total de periodos en la BD)
- **Ícono:** `CalendarCheck` (Lucide), fondo azul (o rojo si sin periodo activo)

#### Tarjeta 3: "Estructura Orgánica"

- **Valor mostrado:** Número de departamentos/programas registrados
- **Subtexto:** "{N} áreas de gestión"
- **Ícono:** `Building2` (Lucide), fondo morado

#### Tarjeta 4: "Base de Cursos"

- **Valor mostrado:** Total de cursos registrados en el sistema
- **Ícono:** `Database` (Lucide), fondo ámbar

#### Gráfico: Distribución de Cuentas Activas

**Barra 1 — Docentes:**
- Valor: `usuarios.filter(u => u.role === 'profesor').length`
- Porcentaje: `(profesores / total) * 100`
- Color de barra: Verde

**Barra 2 — Directores:**
- Valor: `usuarios.filter(u => u.role === 'MANAGEMENT').length`
- Color de barra: Azul

**Barra 3 — Administradores:**
- Valor: `usuarios.filter(u => u.role === 'admin').length`
- Color de barra: Morado

#### Panel de Accesos Rápidos

Estos botones son simplemente `<Link>` de React Router:

| Botón | Texto | Destino URL |
|-------|-------|------------|
| 📅 | "Ajustar Periodos" | `/admin/periodos` |
| 🏢 | "Sincronizar Áreas" | `/admin/departamentos` |
| 🛡️ | "Auditoría de Roles" | `/admin/roles` |
| 👥 | "Carga Masiva Usuarios" | `/admin/usuarios` |

Todos tienen `transition hover:translate-x-1` (se deslizan 4px a la derecha al hover).

#### Tabla: Últimas 5 Cuentas Creadas

- Ordenadas por `id DESC` (las más recientes primero)
- Solo muestra los primeros 5 registros: `usuarios.slice(0, 5)`

**Columna "Identidad":** `user.cedula` en fuente monoespaciada (`font-mono`)

**Columna "Usuario/Correo":**
- Línea 1: `user.name` en negrita
- Línea 2: `user.email` en gris claro

**Columna "Rol de Sistema":**
- `admin` → Etiqueta morada con ícono `ShieldCheck`
- `MANAGEMENT` → Etiqueta azul con texto "Director"
- `profesor` → Etiqueta verde con texto "Docente"

**Columna "Estado de Cuenta":**
- `is_active: true` → Punto LED verde + texto "Operativo"
- `is_active: false` → Punto LED rojo + texto "Suspendido"

---

### 8.B Gestión de Periodos Académicos

**Archivo:** [`PeriodManagement.jsx`](file:///c:/Users/darwin%20roa/restrutura/frontend/src/pages/admin/PeriodManagement.jsx)  
**URL:** `/admin/periodos`

#### Formulario "Crear Nuevo Periodo Académico"

| Campo | Tipo | Placeholder | Validación |
|-------|------|-------------|------------|
| Nombre | `text` | "2026-1" | Required |
| Fecha de Inicio | `date` | (calendar picker) | Required |
| Fecha de Fin | `date` | (calendar picker) | Required |

**Botón "Registrar Periodo":**
- Color: Azul (`#2563eb`)
- Estado cargando: Texto "Creando..." con spinner
- Llama a: `POST /api/periods` con `{ name, start_date, end_date, is_active: false }`
- Los periodos siempre se crean en estado **cerrado**

**Texto advertencia adjunto:**
> "El periodo se creará en estado 'Cerrado'. Deberás activarlo manualmente desde la tabla cuando esté listo."

#### Tabla de Periodos

**Columnas:** Nombre | Inicio | Fin | Estado | Acciones

**Columna Estado:**
- `is_active: true` → Chip verde "Activo"
- `is_active: false` → Chip gris "Cerrado"

**Botón "Editar" (lápiz azul) — Modo Edición Inline:**

Al hacer clic, esa fila entra en modo edición. Las celdas se convierten en `<input type="text">` y `<input type="date">`. El resto de filas permanece en modo lectura.

Los botones que aparecen al editar:
- **"Guardar" (disquete verde):** Llama a `PUT /api/periods/{id}` con `{ name, start_date, end_date }`
- **"Cancelar" (X gris):** Restaura los valores originales sin guardar

**Botón "Aperturar" (play amarillo) — Apertura de Periodo:**

Solo visible en periodos con `is_active: false`.

Al hacer clic muestra:
```
confirm("¿Estás seguro de abrir este periodo? Cerrará otros periodos activos y clonará las tareas a todos los profesores.")
```

Si el usuario acepta:
1. Llama a `POST /api/periods/{id}/open`
2. Espera la respuesta
3. Muestra: `alert("✅ Periodo abierto y tareas clonadas con éxito")`
4. Recarga la lista de periodos

**¿Por qué es importante esto?** Ver sección 12 para la explicación completa del carry-over.

---

### 8.C Gestión de Áreas de Mejora

**Archivo:** [`AreaManagement.jsx`](file:///c:/Users/darwin%20roa/restrutura/frontend/src/pages/admin/AreaManagement.jsx)  
**URL:** `/admin/areas`

Las áreas de mejora son las **categorías bajo las cuales se clasifican las tareas** de los planes (ej: TIC, Pedagogía, Investigación, Didáctica).

#### Formulario "Crear Área"

| Campo | Tipo | Placeholder | Endpoint |
|-------|------|-------------|---------|
| Nombre del Área | `text` | "Ej: Pedagogía" | `POST /api/areas` |

#### Tabla de Áreas

**Columnas:** ID | Nombre | Acciones

**Botón "Eliminar" (papelera roja):**
- Muestra `confirm("¿Eliminar esta área?")`
- Llama a `DELETE /api/areas/{id}`
- ⚠️ **Advertencia:** Eliminar un área que ya está usada en tareas de planes puede romper la consistencia de datos. No hay protección a nivel de BD contra esto.

---

### 8.D Gestión de Departamentos

**Archivo:** [`DepartmentManagement.jsx`](file:///c:/Users/darwin%20roa/restrutura/frontend/src/pages/admin/DepartmentManagement.jsx)  
**URL:** `/admin/departamentos`

Los departamentos en el sistema son técnicamente **programas académicos** (tabla `programas` en la BD). Los usuarios se asocian a un `programa_id`.

#### Formulario "Crear Departamento"

| Campo | Endpoint |
|-------|---------|
| Nombre del Departamento | `POST /api/departments` → Body: `{ name: "Ingeniería de Sistemas" }` |

#### Tabla de Departamentos

**Botón "Eliminar":**
- `DELETE /api/departments/{id}`
- ⚠️ Si hay usuarios con ese `programa_id`, la eliminación fallará por integridad referencial

---

### 8.E Gestión de Cursos (Materias)

**Archivo:** [`CourseManagement.jsx`](file:///c:/Users/darwin%20roa/restrutura/frontend/src/pages/admin/CourseManagement.jsx)  
**URL:** `/admin/cursos`

#### Formulario "Crear Curso"

| Campo | Tipo | Ejemplo | Validación |
|-------|------|---------|------------|
| Nombre del Curso | `text` | "Base de Datos I" | Required |
| Código del Curso | `text` | "IS-402" | Required |
| Departamento | `select` | "Ingeniería de Sistemas" | Required |

El desplegable se llena dinámicamente desde `GET /api/departments`.

Endpoint: `POST /api/courses` con `{ name, code, programa_id }`

#### Tabla de Cursos

Permite búsqueda en tiempo real y edición inline. Soporta eliminación con `DELETE /api/courses/{id}`.

---

### 8.F Gestión de Usuarios

**Archivo:** [`UserManagement.jsx`](file:///c:/Users/darwin%20roa/restrutura/frontend/src/pages/admin/UserManagement.jsx)  
**URL:** `/admin/usuarios`

#### Formulario "Registrar Usuario"

| Campo | Tipo | Descripción | Campo en BD |
|-------|------|-------------|-------------|
| Cédula / Identificación | `number` | Número de identidad único | `cedula` |
| Nombre Completo | `text` | Nombre y apellidos | `nombre` |
| Correo Electrónico | `email` | Email institucional | `email` |
| Contraseña | `password` | Clave temporal inicial | `password` (hasheada) |
| Departamento | `select` | Programa académico | `programa_id` |
| Estado Activo | `checkbox` | Activar/suspender cuenta | `is_active` |

**Endpoint:** `POST /api/users`

La contraseña se hashea con `bcrypt` en el backend antes de guardarse. Nunca se almacena en texto plano.

---

### 8.G Gestión de Roles y Permisos

**Archivo:** [`RoleManagement.jsx`](file:///c:/Users/darwin%20roa/restrutura/frontend/src/pages/admin/RoleManagement.jsx)  
**URL:** `/admin/roles`

Esta pantalla tiene dos secciones:

#### Sección 1: Roles del Sistema (No editables)

Muestra los roles base: `admin`, `director`, `profesor`. Se pueden ver sus permisos pero son de solo lectura.

#### Sección 2: Roles Personalizados (Editables)

Permite crear roles adicionales con combinaciones específicas de permisos.

**Botón "Nuevo Rol":**
- Muestra un formulario inline para ingresar el nombre del nuevo rol
- Permite seleccionar permisos con checkboxes agrupados
- Endpoint: `POST /api/roles`

**Por cada rol en la tabla:**

**Botón "Editar" (lápiz azul):**
- Expande una cuadrícula de checkboxes debajo de la fila
- Los checkboxes están agrupados por categoría
- Botón "Guardar cambios": `PUT /api/roles/{id}` con el array actualizado de permisos
- Botón "Cancelar": Cierra sin guardar

**Botón "Eliminar" (papelera roja):**
- `DELETE /api/roles/{id}`
- No se pueden eliminar roles del sistema base (`admin`, `director`, `profesor`)

---

## 9. MÓDULO 3: DIRECTOR / COORDINADOR

**Directorio:** [`pages/director/`](file:///c:/Users/darwin%20roa/restrutura/frontend/src/pages/director)  
**URL base:** `/director`  
**Rol requerido:** `MANAGEMENT` (exactamente en mayúsculas)  
**Layout:** `DirectorLayout.jsx`

El menú lateral del director se construye **dinámicamente** basándose en los permisos que tenga configurados en la BD. Si un permiso no está habilitado, el ítem del menú no aparece.

---

### 9.A Dashboard del Director

**Archivo:** [`DirectorDashboard.jsx`](file:///c:/Users/darwin%20roa/restrutura/frontend/src/pages/director/DirectorDashboard.jsx)  
**URL:** `/director`

#### Tarjeta "Planes Generados"

Valor: Cantidad de `ImprovementPlan` con `status !== null` del periodo activo, filtrados por los profesores del mismo `programa_id` del director.

#### Tarjeta "Tasa de Aprobación"

Valor: `(acciones_approved / acciones_totales) * 100` expresado como porcentaje.

#### Tarjeta "Profesores a Cargo"

Valor: `GET /api/users` filtrando `role === 'profesor' && programa_id === director.programa_id`

#### Gráfico Donut de Tareas

Implementado con CSS puro (`conic-gradient` o similar). Muestra 3 segmentos:
- **Pendientes** (gris/rojo)
- **En revisión** (amarillo/azul)
- **Aprobadas** (verde)

Los valores se calculan contando las acciones de todos los planes del departamento.

#### Mapa de Calor (Heatmap)

Estructura de matriz:
- **Filas (Y):** Lista de profesores del departamento
- **Columnas (X):** Lista de áreas de gestión

**Valor de cada celda:** Número de tareas completadas y aprobadas por ese profesor en esa área.

**Color de la celda:**
- Intensidad de verde proporcional al valor
- 0 tareas → gris/blanco
- Máximo de tareas → verde oscuro (`#09843B`)

Permite identificar de un vistazo qué combinaciones profesor-área tienen bajo rendimiento.

---

### 9.B Registro de Evaluaciones

**Archivo:** [`EvaluationEntry.jsx`](file:///c:/Users/darwin%20roa/restrutura/frontend/src/pages/director/EvaluationEntry.jsx)  
**URL:** `/director/evaluar`

Esta es la pantalla más importante del flujo porque **sin evaluación, no hay plan de mejora**.

#### Indicador "Periodo Activo"

Muestra el nombre del periodo activo obtenido de `GET /api/periods`. Texto en verde con ícono de calendario.

Si no hay periodo activo, muestra una alerta roja: "⚠ No hay un periodo activo configurado. Por favor contacte al Administrador."

#### Campo: Selección de Profesor

Desplegable que lista todos los usuarios con `role === 'profesor'` del mismo `programa_id` del director.

Fuente: `GET /api/users` filtrado en frontend.

#### Campo: Selección de Curso

Desplegable que lista los cursos del departamento. Fuente: `GET /api/courses`.

#### Campos de Calificación

| Campo | Tipo | Rango | Descripción | Campo en BD |
|-------|------|-------|-------------|-------------|
| Nota de Autoevaluación (Estudiantes) | `number` | 0.0 a 5.0 | Calificación dada por los alumnos | `score_students` |
| Nota de Coevaluación (Director) | `number` | 0.0 a 5.0 | Calificación del director | `score_director` |
| Nota de Autoevaluación (Docente) | `number` | 0.0 a 5.0 | Calificación del propio docente | `score_self` |

El `score_total` se calcula automáticamente en el backend: `round((s1 + s2 + s3) / 3, 1)`.

#### Campo "Comentarios Cualitativos y Hallazgos"

```
Tipo:        textarea (multilínea)
Label:       "Comentarios Cualitativos y Hallazgos"
Campo en BD: director_notes
```

**Este es el campo más crítico de todo el sistema.** El texto aquí escrito se convierte en el **prompt principal** que recibe Google Gemini para generar el plan de mejora. Debe ser detallado y descriptivo.

**Ejemplo bien escrito:**
> "El docente presenta un excelente dominio conceptual de su asignatura. Sin embargo, se identifican debilidades en: (1) manejo de plataformas de aula virtual - no actualiza Moodle regularmente, (2) entrega de calificaciones fuera de los plazos institucionales, (3) escasa participación en actividades de investigación del programa. Los estudiantes valoran su metodología pero reportan dificultades para obtener retroalimentación oportuna."

**Ejemplo mal escrito (insuficiente para la IA):**
> "Buen profesor, necesita mejorar."

#### Campo "Comentarios Representante Estudiantil"

```
Campo en BD: student_rep_comments
Tipo:        textarea
```

#### Carga Masiva de Evaluaciones

**Botón "Carga Masiva (CSV/Excel)":**

Abre un modal con un `<input type="file">` que acepta `.csv` y `.xlsx`.

**Formato requerido del CSV:**
```
Periodo,Email_Profesor,Nota_Estudiantes,Nota_Director,Auto_Nota,Notas_Director,Comentarios_Rep,Comentarios_Estudiantes,Comentarios_Autoevaluacion
2026-1,maria.garcia@unisimon.edu.co,4.2,3.8,4.5,Notas del director,Comentario rep,Comentario1|Comentario2,Autoevaluacion1
```

**Reglas del CSV:**
1. La primera fila es el encabezado (se ignora)
2. El periodo en la columna 0 debe coincidir **exactamente** con el nombre del periodo activo
3. El email en la columna 1 debe existir en la base de datos
4. Los comentarios múltiples se separan con `|`
5. Los decimales pueden usar `,` o `.` como separador

**En carga masiva, NO se llama a Gemini para clasificar sentimientos** (para evitar Rate Limits de la API).

#### Botón "Guardar Evaluación"

Endpoint: `POST /api/evaluations`

**Validaciones en frontend antes de enviar:**
- score_students entre 0 y 5
- score_director entre 0 y 5
- score_self entre 0 y 5
- professor_id no vacío
- period_id debe existir

---

### 9.C Generación de Planes con IA

**Archivo:** [`GeneratePlan.jsx`](file:///c:/Users/darwin%20roa/restrutura/frontend/src/pages/director/GeneratePlan.jsx)  
**URL:** `/director/generar`

Esta es la pantalla donde ocurre "la magia" del sistema.

#### Tabla de Profesores Pendientes

Muestra los profesores que:
1. Tienen evaluación registrada en el periodo activo
2. NO tienen todavía un plan de mejora (`ImprovementPlan`) para ese periodo

Fuente: `GET /api/plans` + `GET /api/users` → diferencia de sets

#### Checkboxes de Selección

**Checkbox en la cabecera (Select All):**
```javascript
onChange={(e) => {
  if (e.target.checked) setSelected(allProfessors.map(p => p.id));
  else setSelected([]);
}}
```

**Checkboxes individuales por fila:**
```javascript
onChange={(e) => {
  if (e.target.checked) setSelected(prev => [...prev, prof.id]);
  else setSelected(prev => prev.filter(id => id !== prof.id));
}}
```

#### Botón "Generar Planes para Seleccionados"

**Flujo técnico completo:**

1. Verifica que `selected.length > 0`
2. Llama a `POST /api/plans/mass-generate` con `{ teacher_ids: selected, period_id: activePeriodId }`
3. El backend responde inmediatamente con un `jobId`
4. El frontend inicia un **polling** con `setInterval` cada 2 segundos a `GET /api/plans/mass-status/{jobId}`
5. Con cada respuesta, actualiza la barra de progreso: `(job.completed / job.total) * 100`
6. Cuando `job.status === 'completed'`, el polling se detiene y muestra el banner de éxito

**Barra de Progreso:**
```
[████████████████████░░░░░░░] 67%
Generando plan para: María García (2 de 3)
```

**Banner de Éxito:**
> "✅ Se generaron exitosamente 3 planes de mejora. Puedes revisarlos en el listado de planes."

**Procesamiento por lotes (Batch Processing):**

El backend procesa los docentes de forma secuencial usando `dispatch()` (Laravel queue síncrono). Para evitar el Rate Limit de la API de Gemini (Error 429 = Demasiadas peticiones), el sistema envía las peticiones una por una con un pequeño delay entre ellas.

---

### 9.D Gestión de Planes de Mejora

**Archivo:** [`PlanesMejora.jsx`](file:///c:/Users/darwin%20roa/restrutura/frontend/src/pages/director/PlanesMejora.jsx)  
**URL:** `/director/planes`

#### Tabla Principal de Planes

**Fuente:** `GET /api/plans`

**Columnas:**

| Columna | Descripción |
|---------|-------------|
| Docente | Nombre del profesor |
| Periodo | Nombre del periodo |
| Progreso | Barra de progreso: `(acciones_verified / total_acciones) * 100` |
| Estado | Chip de color según estado |
| Acciones | Botones de acción |

**Estados del plan y su color:**
- `ai_generated` → Chip amarillo/naranja "Borrador IA" (invisible para el profesor)
- `approved` → Chip verde "Aprobado" (visible para el profesor)
- `rejected` → Chip rojo "Rechazado"

**Botón "Ver Detalle / Editar":**

Abre un panel expandido o navega a una vista de detalle del plan seleccionado.

#### Panel de Edición del Plan

Al abrir el detalle del plan:

**Sección 1 — Métricas Globales:**
- Promedio de calificaciones del docente (de las evaluaciones)
- Estado actual del plan
- Fecha de generación por la IA

**Sección 2 — Diagnóstico:**
El texto de diagnóstico generado por la IA en formato libre.

**Sección 3 — Fortalezas e Oportunidades:**
Arrays de bullets generados por la IA.

**Sección 4 — Listado de Acciones (Tareas):**

Por cada acción/tarea:
```
Orden: #1
Área: TIC
Acción: Completar curso de Moodle
Entregable: Certificado de finalización (PDF)
Meta: Dominar la plataforma institucional
Fecha Límite: 2026-04-30
Estado: pending
```

**Botón "Editar Tarea":**
- Convierte la fila en un formulario editable
- Campos editables: `aspect`, `concrete_action`, `verifiable_product`, `expected_goal`, `deadline`
- "Guardar": `PUT /api/plans/actions/{id}` (o actualiza localmente y guarda el plan completo con `POST /api/plans/save`)

**Botón "Eliminar Tarea" (papelera):**
- Elimina la acción del array local
- Para persistir: debe guardarse el plan completo

**Botón "Agregar Tarea Manual":**
- Abre un modal con un formulario vacío
- El director puede escribir desde cero una tarea personalizada
- Se agrega al array de acciones

#### Botón "Aprobar Plan" (verde, prominente en la parte superior)

**Este es el acto más importante que realiza el director.**

Al hacer clic:
1. Llama a `PATCH /api/plans/{id}/status` con `{ status: "approved" }`
2. El backend guarda `approved_at = now()` y `reviewed_by = director.id`
3. El plan pasa de invisible a **visible para el profesor**
4. La etiqueta del plan cambia de "Borrador IA" a "Aprobado"

**¿Por qué esta separación en dos pasos?** El director actúa como filtro de calidad. La IA puede cometer errores o proponer tareas no pertinentes. El director revisa, edita y solo entonces aprueba.

---

### 9.E Bandeja de Evidencias

**Archivo:** [`BandejaEvidencias.jsx`](file:///c:/Users/darwin%20roa/restrutura/frontend/src/pages/director/BandejaEvidencias.jsx)  
**URL:** `/director/evidencias`

#### Carga de Datos

**Fuente:** `GET /api/evidence/pending`

Por defecto carga solo las evidencias con `verified IS NULL` (pendientes de revisión).

**Botón "Ver Todas":** Agrega `?all=true` a la query para ver también las ya revisadas.

#### Tabla de Evidencias

**Columnas:**

| Columna | Descripción | Fuente |
|---------|-------------|--------|
| Profesor | Nombre del docente | `evidence.teacher.name` |
| Tarea | Descripción de la tarea | `evidence.taskAssignment.fixedTask.activity` o `evidence.planAction.concrete_action` |
| Comentario del Profesor | Lo que escribió al subir | `task_assignment.teacher_response` |
| Archivo | Botón para ver el archivo | `evidence.file_path` |
| Retroalimentación | Input de texto para el director | Local state |
| Acciones | Botones Aprobar/Rechazar | |

#### Botón "Ver Archivo / Abrir Link"

Llama a `GET /api/evidence/view/{id}` que devuelve el binario del archivo con los headers correctos para abrirlo en línea (`Content-Disposition: inline`).

#### Campo "Retroalimentación del Evaluador"

`<input type="text">` local. El valor se incluye en el body al aprobar o rechazar.

#### Botón "Aprobar Evidencia" (verde ✓)

```
Endpoint: PATCH /api/evidence/{id}/verify
Body:     { is_approved: true, teacher_response: "texto del director" }
```

**Efectos en cascada:**
1. `evidence.verified = true`
2. `evidence.verified_at = now()`
3. `evidence.verified_by = director.id`
4. Si `evidence.task_assignment_id`: `task_assignment.status = 'verified'`
5. Si `evidence.plan_action_id`: `plan_action.status = 'verified'`
6. El porcentaje de avance del plan del profesor sube automáticamente

#### Botón "Rechazar Evidencia" (rojo ✗)

```
Endpoint: PATCH /api/evidence/{id}/verify
Body:     { is_approved: false, teacher_response: "El certificado no tiene las horas mínimas requeridas" }
```

**Efectos en cascada:**
1. `evidence.verified = false`
2. Si `task_assignment_id`: `task_assignment.status = 'rejected'`
3. Si `plan_action_id`: `plan_action.status = 'rejected'`
4. El profesor ve la tarea como rechazada con el comentario del director
5. El profesor puede volver a subir una nueva evidencia

---

### 9.F Historial de Evolución

**Archivo:** [`HistorialEvolucion.jsx`](file:///c:/Users/darwin%20roa/restrutura/frontend/src/pages/director/HistorialEvolucion.jsx)  
**URL:** `/director/historial`

#### Fuente de Datos

`GET /api/history/global` — Obtiene las evaluaciones de todos los periodos para el departamento del director.

#### Desplegable "Periodo de Referencia"

Lista todos los periodos que tienen evaluaciones registradas. Al seleccionar uno, el sistema automáticamente busca el periodo anterior (por `start_date` menor) como periodo de comparación.

#### Tarjetas de Tendencia

| Tarjeta | Descripción |
|---------|-------------|
| 📈 Mejoraron | `nota_nuevo > nota_anterior` |
| ➡ Estables | `nota_nuevo === nota_anterior` |
| 📉 Empeoraron | `nota_nuevo < nota_anterior` |

**Lógica exacta:**
```javascript
const diff = parseFloat(evaluacion_nueva.score_total) - parseFloat(evaluacion_anterior.score_total);
if (diff > 0) categoria = "mejoro";
if (diff === 0) categoria = "estable";
if (diff < 0) categoria = "empeoro";
```

#### Tabla Comparativa

| Columna | Descripción |
|---------|-------------|
| Profesor | Nombre del docente |
| Nota Periodo Anterior | `score_total` del periodo de comparación |
| Nota Periodo Evaluado | `score_total` del periodo de referencia |
| Diferencia | `diff` con indicador visual |

**Indicador de Diferencia:**
- Positivo: `▲ +0.40` en color verde
- Negativo: `▼ -0.80` en color rojo
- Cero: `→ 0.00` en color gris

---

### 9.G Exportar Planes de Trabajo y Reportes

**Archivos:** [`ExportarDirector.jsx`](file:///c:/Users/darwin%20roa/restrutura/frontend/src/pages/director/ExportarDirector.jsx) y [`PlanTrabajo.jsx`](file:///c:/Users/darwin%20roa/restrutura/frontend/src/pages/director/PlanTrabajo.jsx)  
**URLs:** `/director/exportar` y `/director/tareas`

#### PlanTrabajo.jsx — Tareas Institucionales

Muestra la matriz de cumplimiento de tareas institucionales (FixedTasks).

**Fuente:** `GET /api/export/global/matrix-json`

Permite filtrar por área de gestión y ver el cumplimiento por profesor.

#### ExportarDirector.jsx — Exportación de Documentos

**Botón "Exportar PDF" por plan:**
- URL: `GET /api/export/plan/{planId}/pdf`
- El servidor usa `barryvdh/laravel-dompdf` para renderizar el HTML del plan en PDF
- Descarga automática: `plan_mejora_{nombre_docente}.pdf`
- Papel: Carta (Letter) — 8.5 x 11 pulgadas
- El PDF incluye: membrete institucional, datos del docente, diagnóstico, fortalezas, acciones, firma del director

**Botón "Exportar CSV Global":**
- URL: `GET /api/export/global/csv`
- Descarga: `planes_mejora_global.csv`
- Columnas: ID, Docente, Periodo, Estado, Diagnóstico (200 chars), # Acciones

**Botón "Exportar Matriz Excel":**
- URL: `GET /api/export/global/excel-matriz`
- Descarga: `matriz_cumplimiento.xls`
- Formato: HTML con cabeceras de Excel (compatible con Microsoft Excel)
- Estructura: Filas = Tareas (agrupadas por área), Columnas = Profesores
- Valores: `S` (cumplió/verificado) o `N` (no cumplió)
- Si la tarea verificada tiene `teacher_response`, se muestra ese texto en la celda

---

### 9.H Gestión de Cursos del Director

**Archivo:** [`GestionCursos.jsx`](file:///c:/Users/darwin%20roa/restrutura/frontend/src/pages/director/GestionCursos.jsx)  
**URL:** `/director/cursos`

Similar a la gestión de cursos del admin pero limitada al programa del director.

Permite:
- Ver cursos del departamento
- Asignar profesores a cursos: `POST /api/courses/assign`
- Ver las asignaciones existentes: `GET /api/courses/assignments`
- Eliminar asignaciones: `DELETE /api/courses/assign/{id}`

---

## 10. MÓDULO 4: PROFESOR

**Archivo:** [`ProfesorDashboard.jsx`](file:///c:/Users/darwin%20roa/restrutura/frontend/src/pages/profesor/ProfesorDashboard.jsx)  
**URL:** `/profesor`  
**Rol requerido:** `profesor`

El profesor tiene **UNA SOLA PANTALLA** — un dashboard integral que lo muestra todo.

### Sección Superior: Resumen de Calificaciones

**Tarjeta "Mi Calificación Promedio":**

Fuente: `GET /api/evaluations/teacher/{profesor.id}` — obtiene todas las evaluaciones del periodo activo y calcula el promedio de `score_total`.

**Barra de Progreso General del Plan:**

Fuente: `GET /api/plans/my-plan`

Cálculo: `(acciones con status 'verified') / (total de acciones) * 100`

```
Ejemplo visual:
[████████████████████░░░░░░░░░░] 62% completado
```

### Sección "Mis Tareas Pendientes y Plan de Mejora"

Fuente: `GET /api/plans/my-plan`

El endpoint devuelve las acciones del plan actual **más** las acciones de deuda de periodos anteriores, todas en el campo `PlanActions`.

#### Por Cada Tarea en la Lista:

**Encabezado de la tarea:**
- Área de gestión: Chip de color con `action.aspect` (ej: "TIC", "Pedagogía")
- Si `action.carry_over_count > 0`: Banner rojo de advertencia

**Banner de Tarea Arrastrada:**
```
⚠ Tarea Arrastrada de periodos anteriores
   Arrastrada {carry_over_count} veces
```

**Descripción:**
- `action.concrete_action`: Qué debe hacer

**Entregable requerido:**
- `action.verifiable_product`: Qué debe presentar como evidencia

**Fecha límite:**
- `action.deadline`: Formato `YYYY-MM-DD`

**Etiqueta de Estado:**
| Valor | Color | Texto mostrado |
|-------|-------|----------------|
| `pending` | Gris | "Pendiente" |
| `completed` | Amarillo/Azul | "En Revisión" |
| `verified` | Verde | "Aprobada ✓" |
| `rejected` | Rojo | "Rechazada ✗" |
| `not_delivered` | Rojo oscuro | "No Entregado" |

### Botón "Subir Evidencia"

Visible en tareas con estado `pending`, `rejected` o `not_delivered`.

Al hacer clic, abre un **modal/ventana emergente** con el formulario de carga.

#### Modal "Subir Soporte de Evidencia"

**Campo 1: Adjuntar Archivo**
```
Tipo:       <input type="file">
Acepta:     Cualquier formato (PDF, DOCX, JPG, PNG, etc.)
Límite:     20MB (20480 kilobytes según el backend)
Required:   No (puede subir solo un link)
```

**Campo 2: Comentarios del Profesor**
```
Tipo:       <textarea>
Destino BD: task_assignment.teacher_response
Propósito:  Nota aclaratoria para el director
Ejemplo:    "Adjunto certificado de finalización del curso Moodle con 40 horas certificadas."
```

**Botón "Enviar Evidencia":**

```
Endpoint:   POST /api/evidence
Tipo:       multipart/form-data
Body:
  - file:            [binario del archivo]
  - plan_action_id:  [id de la acción] (si es plan de mejora)
  - task_id:         [id de la asignación] (si es tarea institucional)
  - teacher_response: [comentario del profesor]
```

**Al recibir respuesta exitosa:**
1. Cierra el modal
2. Actualiza el estado de la tarea a "En Revisión" (localmente y en BD)
3. Muestra un toast/alert: "✅ Evidencia enviada correctamente"
4. Se envía notificación automática a todos los directores del programa

**Botón "Cancelar":**
- Cierra el modal sin hacer nada
- Los campos del formulario se resetean

---

## 11. MOTOR DE INTELIGENCIA ARTIFICIAL (GOOGLE GEMINI)

### ¿Qué modelo se usa?

`gemini-1.5-pro` (configurado en `AIService.php`)

### ¿Cómo construye el prompt?

El `AIService` recibe este contexto del `PlanController`:

```php
[
  'teacher'            => User $teacher,         // Nombre del docente
  'evaluation'         => Evaluation $eval,       // Notas + comentarios cualitativos
  'assignments'        => Collection $courses,    // Cursos que imparte
  'previousPlans'      => Collection $history,    // Últimos 3 planes de mejora
  'excludeSelfEvaluation' => true,
]
```

El `ai_prompt_context` que se guarda en la BD tiene este formato:
```
"Docente: María García | Cursos: Base de Datos I, Algoritmos | 
Calificaciones: Estudiantes: 4.2, Director: 3.8, Autoevaluación: 4.5, Total: 4.2"
```

### ¿Qué devuelve la IA?

La IA genera un objeto JSON con esta estructura:

```json
{
  "diagnosis_text": "Narrativa diagnóstica del desempeño del docente...",
  "strengths": [
    "Excelente dominio conceptual de la asignatura",
    "Alta calificación estudiantil"
  ],
  "improvement_opportunities": [
    "Manejo de plataformas digitales",
    "Puntualidad en entrega de calificaciones"
  ],
  "objectives": [
    "Mejorar competencias digitales para el primer semestre 2026"
  ],
  "plan_actions": [
    {
      "aspect": "TIC",
      "concrete_action": "Completar el curso institucional de Moodle en el campus virtual",
      "verifiable_product": "Certificado de finalización del curso (PDF)",
      "expected_goal": "Dominar la plataforma de aula virtual al 100%",
      "deadline": "2026-04-30"
    },
    {
      "aspect": "Gestión Académica",
      "concrete_action": "Registrar calificaciones dentro de los plazos reglamentarios",
      "verifiable_product": "Pantallazos del registro de notas con fecha y hora",
      "expected_goal": "Zero incumplimientos en entrega de notas",
      "deadline": "2026-06-15"
    }
  ],
  "consolidated_comments": ["Docente comprometido con la mejora"],
  "work_plan": { ... },
  "history_analysis": "Comparado con el periodo anterior, el docente..."
}
```

### Validación y Corrección de Fechas

El backend **corrige automáticamente** las fechas propuestas por la IA para que queden dentro del rango del periodo:

```php
// Si la fecha de la acción está antes del inicio del periodo:
if ($deadline < $pStart) $deadline = $pStart;
// Si la fecha de la acción está después del fin del periodo:  
if ($deadline > $pEnd) $deadline = $pEnd;
// Si el año es incorrecto, se ajusta al año del periodo
$deadline = $pYear . substr($deadline, 4);
```

### Manejo de Errores de la API Gemini

**Error 429 (Rate Limit — Demasiadas peticiones):**
- La generación masiva procesa de forma secuencial (no en paralelo)
- Si falla un docente, el error se registra en `job.results` como `{ status: "error" }`
- El proceso continúa con los demás docentes
- Al final se informa cuántos fallaron: `job.failed`

**Error de timeout:**
- El backend tiene `set_time_limit(0)` para desactivar el timeout de PHP
- Sin esto, PHP cortaría la ejecución a los 60 segundos (número configurado en `php.ini`)

---

## 12. LÓGICA DE CARRY-OVER (ARRASTRE DE TAREAS)

### ¿Qué es el Carry-Over?

Cuando se abre un nuevo periodo académico, las tareas que un profesor tenía pendientes (sin evidencia subida) en el periodo anterior **no desaparecen**. Se "arrastran" automáticamente al nuevo periodo, marcadas con un contador de veces que han sido arrastradas.

### ¿Cuándo ocurre?

**Únicamente** cuando el administrador hace clic en "Aperturar" un periodo (endpoint `POST /api/periods/{id}/open`).

### Proceso Completo Paso a Paso (Código Real)

#### Paso 1: Desactivar periodo anterior

```php
Period::where('is_active', true)->update(['is_active' => false]);
$period = Period::findOrFail($id);
$period->update(['is_active' => true]);
```

#### Paso 2: Identificar tareas para arrastrar

```php
// Buscar tareas de periodos anteriores que están pendientes o en curso
$actionsToCarryOver = PlanAction::whereIn('status', ['pending', 'in_progress'])
    ->whereHas('plan', function($q) use ($oldPeriodIds) {
        $q->whereIn('period_id', $oldPeriodIds);
    })
    ->get();
```

#### Paso 3: Marcar como no entregadas

```php
foreach($actionsToCarryOver as $action) {
    $action->status = 'not_delivered';
    $action->needs_carry_over = true;  // Bandera para el siguiente paso
    $action->save();
}
```

#### Paso 4: Clonar al nuevo periodo

```php
foreach($needsCarry as $act) {
    // Si el profesor no tiene plan en el nuevo periodo, crear uno vacío
    if (!$existingPlan) {
        $existingPlan = ImprovementPlan::create([
            'teacher_id' => $teacherId,
            'period_id' => $period->id,
            'status' => 'approved', // APROBADO automáticamente para que el profesor lo vea
            'diagnosis_text' => 'Plan autogenerado para contener tareas arrastradas.',
        ]);
    }
    
    // Clonar la tarea con carry_over_count incrementado
    PlanAction::create([
        'plan_id' => $newPlan->id,
        'aspect' => $act->aspect,
        'concrete_action' => $act->concrete_action,
        'verifiable_product' => $act->verifiable_product,
        'expected_goal' => $act->expected_goal,
        'deadline' => $period->end_date,  // Fecha límite = fin del nuevo periodo
        'status' => 'pending',
        'carry_over_count' => $act->carry_over_count + 1,  // Incrementar contador
    ]);
}
```

#### Paso 5: Clonar tareas institucionales (FixedTasks)

```php
// Asignar masivamente tareas institucionales a todos los profesores activos
foreach (array_chunk($inserts, 500) as $chunk) {
    TaskAssignment::insert($chunk);
}
```

### ¿Cómo lo Ve el Profesor?

En su dashboard, las tareas arrastradas aparecen con:
```
⚠ Tarea Arrastrada de periodos anteriores
   Arrastrada 2 veces
```

La bandera `is_debt: true` se agrega en el `getMyPlan` del `PlanController`.

### Regla Importante

Un plan creado automáticamente por el carry-over se crea con `status: 'approved'` para que el profesor lo vea de inmediato, sin que el director tenga que aprobarlo manualmente. Esto garantiza que el profesor sepa desde el primer día del semestre qué tareas pendientes trae del semestre anterior.

---

## 13. SISTEMA DE EXPORTACIÓN

### PDF del Plan Individual

**Proceso:**
1. Frontend llama: `GET /api/export/plan/{planId}/pdf`
2. El servidor carga el plan con todas sus relaciones (teacher, period, actions, evaluation)
3. `ExportService::generarHTMLCartaModelo($plan, $userModel)` genera el HTML
4. `Pdf::loadHTML($html)->setPaper('letter')` renderiza el PDF
5. Se devuelve como descarga: `attachment; filename="plan_mejora_{nombre}.pdf"`

**Contenido del PDF:**
- Membrete institucional (Universidad Simón Bolívar)
- Datos del docente y periodo
- Diagnóstico narrativo
- Fortalezas identificadas
- Oportunidades de mejora
- Objetivos del plan
- Tabla de acciones con fechas y entregables
- Firma del director (si tiene `signature_path` configurado)

### Previsualización HTML del Plan

Antes de descargar el PDF, se puede previsualizar:

`GET /api/export/plan/{planId}/preview` → Devuelve `text/html` del mismo documento.

### CSV Global

`GET /api/export/global/csv` → Descarga `planes_mejora_global.csv`

### Matriz de Cumplimiento Excel

`GET /api/export/global/excel-matriz` → Descarga `matriz_cumplimiento.xls`

La estructura es:
```
CEDULA | Docente1 | Docente2 | Docente3
ÁREA 1 |          |          |
  Tarea 1.1 | S  | N  | S
  Tarea 1.2 | N  | N  | S
ÁREA 2 |          |          |
  Tarea 2.1 | S  | S  | N
```

Donde `S` = tarea verificada, `N` = no cumplida.

---

## 14. SISTEMA DE NOTIFICACIONES

### ¿Cuándo se Genera una Notificación?

**Evento:** Cuando un profesor sube una evidencia.

**Código relevante (EvidenceController):**
```php
$directors = User::whereNotIn('role', ['profesor', 'admin', 'estudiante'])
                 ->where('programa_id', $jwtUser->programa_id)
                 ->get();
Notification::send($directors, new EvidenceUploaded($evidence, $jwtUser, $taskName));
```

Se notifica a **todos los usuarios que no son profesores, admin o estudiantes** del mismo programa.

### Endpoints de Notificaciones

| Endpoint | Descripción |
|----------|-------------|
| `GET /api/notifications` | Lista las notificaciones del usuario autenticado |
| `PATCH /api/notifications/{id}/read` | Marca una como leída |
| `PATCH /api/notifications/read-all` | Marca todas como leídas |

### ¿Cómo se Muestran en la Interfaz?

En el `DirectorLayout.jsx` hay un indicador de notificaciones en el header (campana) con el contador de no leídas. Al hacer clic, abre un panel lateral con el listado.

---

## 15. GUÍA DE INSTALACIÓN Y CONFIGURACIÓN DEL SERVIDOR

### Prerequisitos

- PHP 8.1 o superior
- Composer
- MySQL 8.x
- Node.js 18.x o superior
- npm

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/darwin-roa/restrutura.git
cd restrutura
```

### Paso 2: Configurar el Backend (Laravel)

```bash
cd backend-php
cp .env.example .env
```

Editar el `.env` con los valores correctos:

```env
APP_NAME="Sistema Planes Mejora USB"
APP_ENV=local
APP_URL=http://localhost:8000
APP_DEBUG=true

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=nombre_de_tu_base_de_datos
DB_USERNAME=root
DB_PASSWORD=tu_contraseña

JWT_SECRET=genera_una_clave_aleatoria_larga_aqui
JWT_EXPIRES_IN=480

GEMINI_API_KEY=tu_clave_de_api_de_google_gemini

QUEUE_CONNECTION=sync
CACHE_DRIVER=file
```

### Paso 3: Instalar Dependencias PHP

```bash
composer install
```

### Paso 4: Generar la Clave de Aplicación Laravel

```bash
php artisan key:generate
```

### Paso 5: Ejecutar las Migraciones

```bash
php artisan migrate
```

### Paso 6: Crear el Directorio de Uploads

```bash
mkdir -p public/uploads
chmod 755 public/uploads
```

En Windows, simplemente crear la carpeta `backend-php/public/uploads/`.

### Paso 7: Iniciar el Backend

```bash
php artisan serve --port=8000
```

### Paso 8: Configurar el Frontend

```bash
cd ../frontend
npm install
```

Verificar que `src/api/axios.js` tenga la `baseURL` correcta:
```javascript
const api = axios.create({
  baseURL: 'http://localhost:8000/api'
});
```

### Paso 9: Iniciar el Frontend

```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173`.

### Paso 10: Crear el Usuario Administrador Inicial

Opción A — Desde MySQL directamente:
```sql
INSERT INTO usuarios (nombre, email, cedula, password, role, is_active, creado_en, updatedAt) 
VALUES (
  'Administrador Principal', 
  'admin@unisimon.edu.co', 
  1234567890,
  '$2y$10$...hash_bcrypt_de_tu_password...', 
  'admin', 
  1, 
  NOW(), 
  NOW()
);
```

Opción B — Usando un Seeder de Laravel:
```bash
php artisan db:seed --class=AdminSeeder
```

### Script de Inicio Rápido (Windows)

El repositorio incluye `run_all.bat` que inicia ambos servidores con un doble clic.

```batch
start cmd /k "cd backend-php && php artisan serve"
start cmd /k "cd frontend && npm run dev"
```

---

## 16. FLUJOS DE TRABAJO COMPLETOS (END-TO-END)

### Flujo 1: Primer Uso del Sistema (Configuración Inicial)

```
ADMIN entra a /admin
  │
  ├─> /admin/departamentos → Crear departamentos (Ing. de Sistemas, etc.)
  │
  ├─> /admin/areas → Crear áreas de gestión (TIC, Pedagogía, Investigación...)
  │
  ├─> /admin/cursos → Crear cursos/materias con sus códigos
  │
  ├─> /admin/usuarios → Crear cuentas de directores y profesores
  │
  ├─> /admin/roles → Configurar permisos del rol MANAGEMENT
  │
  └─> /admin/periodos → Crear un periodo (ej: 2026-1) → Hacer clic en "Aperturar"
                         ↓
                     Sistema clona tareas y activa el periodo
```

### Flujo 2: Ciclo Semestral Completo

```
[INICIO DE SEMESTRE]
  │
  ADMIN abre el periodo
  └─> Sistema clona tareas, carry-over de pendientes
  
  DIRECTOR entra a /director/evaluar
  └─> Ingresa evaluaciones de cada docente (notas + comentarios)
  └─> O carga masiva con CSV
  
  DIRECTOR entra a /director/generar
  └─> Selecciona todos los profesores con evaluaciones
  └─> Clic en "Generar Planes para Seleccionados"
  └─> Espera que la barra llegue al 100%
  
  DIRECTOR entra a /director/planes
  └─> Por cada plan en estado "Borrador":
      └─> Ver detalle
      └─> Editar/eliminar tareas si es necesario
      └─> Agregar tareas manuales si es necesario
      └─> Clic en "Aprobar Plan" → El profesor puede verlo
  
[DURANTE EL SEMESTRE]
  │
  PROFESOR ve sus tareas en /profesor
  └─> Por cada tarea pendiente:
      └─> Hace la actividad requerida
      └─> Clic en "Subir Evidencia"
      └─> Adjunta archivo o escribe comentario
      └─> Envía → Estado cambia a "En Revisión"
  
  DIRECTOR ve nueva notificación en /director/evidencias
  └─> Abre el archivo enviado
  └─> Escribe retroalimentación
  └─> Aprueba o rechaza
      └─> Si aprueba: Tarea → "Aprobada", progreso del plan sube
      └─> Si rechaza: Tarea → "Rechazada", el profesor puede reintentar

[FIN DE SEMESTRE]
  │
  DIRECTOR entra a /director/historial
  └─> Analiza comparativa de desempeño vs periodo anterior
  
  DIRECTOR entra a /director/exportar
  └─> Descarga PDFs de planes para archivo institucional
  └─> Descarga matriz de cumplimiento en Excel
  
  ADMIN abre el siguiente periodo
  └─> El ciclo se repite
```

### Flujo 3: Carga Masiva de Evaluaciones

```
DIRECTOR descarga plantilla CSV
  └─> Llena con los datos de cada docente
  └─> Formato: Periodo;Email;Nota_Est;Nota_Dir;Auto;Notas;Comentarios...
  └─> Para comentarios múltiples: separar con "|"
  
DIRECTOR va a /director/evaluar
  └─> Clic en "Carga Masiva"
  └─> Selecciona el archivo CSV o Excel
  └─> El sistema valida cada fila:
      └─> Si periodo no coincide → Error, fila omitida
      └─> Si email no existe → Error, fila omitida
      └─> Si todo ok → Evaluación creada/actualizada
  └─> Muestra resumen: "X evaluaciones procesadas, Y errores"
```

---

## 17. GLOSARIO TÉCNICO

| Término | Definición |
|---------|-----------|
| **JWT** | JSON Web Token. Token de autenticación firmado digitalmente. Contiene el ID, nombre, rol y programa del usuario. Expira en 8 horas. |
| **Carry-Over** | Lógica de arrastre de tareas pendientes de un periodo al siguiente. Una tarea arrastrada tiene `carry_over_count > 0`. |
| **FixedTask** | Tarea institucional fija configurada por el admin o director que se asigna a todos los profesores al abrir un periodo. |
| **TaskAssignment** | La instancia individual de una FixedTask asignada a un profesor específico en un periodo específico. |
| **ImprovementPlan** | Plan de mejora profesoral. Generado por la IA o manualmente. Contiene diagnóstico y múltiples PlanActions. |
| **PlanAction** | Una tarea específica dentro de un ImprovementPlan. Tiene descripción, entregable, meta, fecha límite y estado. |
| **Evidence** | Archivo o comentario subido por el profesor como prueba de cumplimiento de una tarea. |
| **Score Total** | Promedio aritmético de las tres notas: `(score_students + score_director + score_self) / 3`. |
| **Periodo Activo** | El único periodo con `is_active = true`. Solo puede haber uno activo a la vez. |
| **Programa** | Sinónimo de Departamento en este sistema. Tabla `programas` en la BD. Campo `programa_id` en usuarios. |
| **MANAGEMENT** | El valor exacto del campo `role` para directores/coordinadores. Siempre en MAYÚSCULAS. |
| **ai_generated** | Estado inicial de un plan recién generado por la IA. Es invisible para el profesor hasta ser aprobado. |
| **Rate Limit** | Límite de peticiones por minuto de la API de Google Gemini. El sistema los evita procesando de forma secuencial. |
| **Multipart/form-data** | Tipo de contenido HTTP para enviar archivos binarios en formularios. Usado al subir evidencias. |
| **Upsert** | Operación de base de datos que crea el registro si no existe o lo actualiza si ya existe. Usado en `/plans/save`. |
| **Soft Delete** | Eliminación lógica: el registro se marca con `deletedAt = now()` en lugar de borrarse físicamente. |
| **DomPDF** | Librería PHP para generar PDFs a partir de HTML. Usada para exportar planes. |

---

## 18. FAQ Y TROUBLESHOOTING

### ❓ El director no puede acceder a /director. ¿Por qué?

**Causa:** El usuario tiene el rol `director` (en minúsculas) en la BD en lugar de `MANAGEMENT`.

**Solución:** 
```sql
UPDATE usuarios SET role = 'MANAGEMENT' WHERE email = 'director@unisimon.edu.co';
```

O desde el frontend: Admin → Roles → Buscar el usuario → Cambiar su rol.

---

### ❓ Al abrir un periodo, dice "Error: 0 tareas clonadas" cuando debería clonar

**Causa:** No hay tareas en la tabla `fixed_tasks` para ese periodo, o los profesores no están asignados al `programa_id` del director.

**Verificación:**
```sql
SELECT * FROM fixed_tasks WHERE period_id = {id_del_periodo} AND is_active = 1;
SELECT * FROM usuarios WHERE role = 'profesor' AND is_active = 1;
```

---

### ❓ La IA genera un plan pero la fecha límite de las tareas queda fuera del periodo

**Causa:** La IA sugiere fechas basadas en su conocimiento general, no en las fechas exactas del periodo.

**Solución:** El sistema corrige esto automáticamente en el `PlanController.save()`. Si aún así las fechas están mal, verificar que el periodo tenga `start_date` y `end_date` correctamente configurados en la BD.

---

### ❓ Error 413 al subir un archivo de evidencia

**Causa:** El archivo supera el límite configurado en PHP (`upload_max_filesize` o `post_max_size` en `php.ini`) o en Nginx/Apache.

**Solución en php.ini:**
```ini
upload_max_filesize = 25M
post_max_size = 25M
```

Reiniciar el servidor después del cambio.

---

### ❓ Error 429 durante la generación masiva de planes

**Causa:** La API de Google Gemini rechazó la petición por exceso de frecuencia.

**Solución:** El sistema está diseñado para procesar secuencialmente. Si el error persiste, es porque el plan gratuito de Gemini tiene límites muy estrictos. Considerar:
1. Usar el plan de pago de Google Gemini
2. Agregar un `sleep(2)` entre peticiones en `AIService.php`

---

### ❓ El PDF exportado sale en blanco o con caracteres extraños

**Causa:** DomPDF tiene limitaciones con caracteres especiales (tildes, ñ) si el HTML no tiene la codificación correcta.

**Verificación:** El HTML generado por `ExportService::generarHTMLCartaModelo` debe tener:
```html
<meta charset="UTF-8">
```

---

### ❓ Un profesor ve una tarea arrastrada que ya la cumplió en el periodo anterior

**Causa:** El carry-over solo se activa para tareas en estado `pending` o `in_progress`. Si la tarea estaba en estado `completed` (evidencia subida pero no aprobada por el director), también se arrastra.

**Solución:** El director debe aprobar/rechazar TODAS las evidencias antes de abrir el nuevo periodo.

---

### ❓ La barra de progreso del plan no llega al 100% aunque el profesor cumplió todo

**Causa:** El progreso se calcula sobre las acciones con `status = 'verified'`. Si alguna está en `completed` (evidencia subida) pero no ha sido revisada por el director, no cuenta.

**Solución:** El director debe entrar a la Bandeja de Evidencias y aprobar las evidencias pendientes.

---

### ❓ Cómo resetear la contraseña de un usuario

**Opción desde la BD:**
```php
// Generar el hash desde PHP
echo password_hash('nueva_contraseña', PASSWORD_BCRYPT);
```

```sql
UPDATE usuarios SET password = '$2y$10$...' WHERE email = 'usuario@unisimon.edu.co';
```

**Opción desde el frontend:** Admin → Usuarios → Editar usuario → Escribir nueva contraseña → Guardar.

---

### ❓ ¿Cómo saber exactamente qué endpoint está llamando el frontend?

Abrir las DevTools del navegador (F12) → Pestaña "Network" → Filtrar por "Fetch/XHR". Cada llamada muestra la URL, el método HTTP, el body y la respuesta.

---

*Fin del Manual — Última actualización: Mayo 2026*  
*Universidad Simón Bolívar · Facultad de Ingeniería de Sistemas · Sede Cúcuta*
