# 📖 Manual de Usuario e Interfaz Detallado.

Este documento describe de manera exhaustiva y detallada cada pantalla, casilla, botón, alerta, notificación y funcionalidad del **Sistema de Gestión de Planes de Mejora Profesoral con IA** de la Universidad Simón Bolívar. Está organizado rol por rol y pantalla por pantalla para servir como guía de referencia absoluta.

---

## 🔒 1. PÁGINA DE LOGIN (Inicio de Sesión)
Ubicación en el código: [Login.jsx](file:///c:/Users/darwin%20roa/restrutura/frontend/src/pages/Login.jsx)

Es el portal de acceso seguro al sistema. Cuenta con un diseño dividido en dos secciones:

### Panel Izquierdo (Informativo e Institucional)
*   **Logotipo de la Universidad:** Muestra el icono de un birrete de graduación (`GraduationCap`) y los textos *"Universidad Simón Bolívar"* e *"Ingeniería de Sistemas · Cúcuta"*.
*   **Título Principal:** *"Portal de Mejora Profesoral"*.
*   **Tarjetas de Funcionalidades (Feature Pills):** Tres pastillas visuales que informan sobre el alcance de la plataforma:
    1.  *Seguimiento por periodo activo.*
    2.  *Copilot IA para planes de mejora.*
    3.  *Auditoría de evidencias docentes.*

### Panel Derecho (Formulario de Acceso)
*   **Etiqueta de "Acceso seguro":** Un indicador visual verde superior con un icono de escudo (`ShieldCheck`).
*   **Casilla 1: "Email institucional" (Input de Texto/Email):**
    *   *Qué hace:* Permite escribir el correo electrónico del usuario.
    *   *Marcador de posición (Placeholder):* `nombre@unisimon.edu.co`.
    *   *Comportamiento visual:* Al hacer clic (foco), el borde cambia a color verde institucional (`#09843B`) y muestra una sutil sombra exterior. Al salir (blur), vuelve a gris claro.
    *   *Restricción:* Es obligatorio (`required`) y debe cumplir con el formato de correo electrónico.
*   **Casilla 2: "Contraseña" (Input de Contraseña):**
    *   *Qué hace:* Permite escribir la contraseña de seguridad.
    *   *Botón Ojo (Mostrar/Ocultar):* Ubicado a la derecha dentro de la casilla. Al hacer clic en el icono del ojo abierto (`Eye`), la contraseña se hace visible en texto claro. Al hacer clic en el ojo tachado (`EyeOff`), los caracteres vuelven a ocultarse tras puntos.
*   **Botón 3: "Ingresar a la plataforma" (Botón de Envío):**
    *   *Qué hace:* Envía el formulario para autenticar las credenciales en la base de datos (JWT a través del endpoint `/api/login`).
    *   *Estados de Carga:* Mientras el servidor responde, el botón cambia de color verde a gris, se deshabilita para evitar clics dobles, y muestra un círculo giratorio (*spinner*) con el texto *"Verificando..."*.
*   **Notificaciones y Alertas:**
    *   *Alerta de error:* Si las credenciales no son válidas, aparece un recuadro de color rojo pastel en la parte superior del formulario con el mensaje *"⚠ Credenciales incorrectas. Verifique su email y contraseña."*.

---

## 🛠 2. MÓDULO DE ADMINISTRADOR (Gestión de Infraestructura)
Ubicación en el código: [pages/admin/](file:///c:/Users/darwin%20roa/restrutura/frontend/src/pages/admin)

### A. Dashboard del Administrador
Ubicación: [AdminDashboard.jsx](file:///c:/Users/darwin%20roa/restrutura/frontend/src/pages/admin/AdminDashboard.jsx)

Es la primera vista que observa el administrador al ingresar. Está enfocada en la salud técnica del sistema.

#### 📊 Tarjetas de Métricas de Infraestructura
1.  **Salud del Sistema:**
    *   *Qué muestra:* Un porcentaje calculado dinámicamente como `(Usuarios Activos / Usuarios Totales) * 100`.
    *   *Detalle inferior:* Número exacto de usuarios operativos.
    *   *Icono:* Servidor (`Server`) sobre fondo verde.
2.  **Periodo Académico:**
    *   *Qué muestra:* El nombre del periodo actual que se encuentra en estado activo (ej. `2026-1`). Si no hay ninguno activo, resalta en rojo con el texto *"Sin Configurar"*.
    *   *Detalle inferior:* Total de periodos históricos registrados.
    *   *Icono:* Calendario (`CalendarCheck`) sobre fondo azul (o rojo si no hay activo).
3.  **Estructura Orgánica:**
    *   *Qué muestra:* La cantidad de departamentos y áreas registradas.
    *   *Icono:* Edificio (`Building2`) sobre fondo morado.
4.  **Base de Cursos:**
    *   *Qué muestra:* La cantidad total de cursos/materias académicas cargadas en el sistema.
    *   *Icono:* Base de datos (`Database`) sobre fondo ámbar.

#### 📈 Gráfico: Distribución de Cuentas Activas
*   **Barra 1: Docentes (Profesores):** Muestra el número total de profesores y su porcentaje respecto al total de usuarios mediante una barra de progreso verde.
*   **Barra 2: Directores/Coordinadores:** Muestra el número de directores y su porcentaje con una barra azul.
*   **Barra 3: Administradores:** Muestra los administradores del sistema y su porcentaje con una barra morada.

#### ⚙ Panel de Accesos Rápidos (Botones Directos)
*   **Botón "Ajustar Periodos":** Redirecciona a `/admin/periodos`.
*   **Botón "Sincronizar Áreas":** Redirecciona a `/admin/departamentos` (Gestión de departamentos y áreas).
*   **Botón "Auditoría de Roles":** Redirecciona a `/admin/roles`.
*   **Botón "Carga Masiva Usuarios":** Redirecciona a `/admin/usuarios`.
*   *Efecto:* Todos los accesos rápidos tienen efectos de transición hover y se desplazan sutilmente a la derecha al colocar el mouse encima.

#### 📋 Tabla: Últimas Creaciones de Cuentas
Muestra los últimos 5 usuarios creados en orden cronológico descendente.
*   *Columna Identidad (Cédula):* Cédula de identidad en fuente monoespaciada para fácil lectura.
*   *Columna Usuario / Correo:* Nombre completo del usuario en negrita y su correo institucional abajo en gris.
*   *Columna Rol de Sistema:* Muestra etiquetas coloreadas según el rol:
    *   `Administrador`: Etiqueta morada con escudo.
    *   `Docente`: Etiqueta verde.
    *   `Director`: Etiqueta azul.
*   *Columna Estado de Cuenta:* Muestra un indicador circular tipo LED. Verde con el texto *"Operativo"* si está activo; rojo con el texto *"Suspendido / Inactivo"* si está deshabilitado.

---

### B. Gestión de Periodos Académicos
Ubicación: [PeriodManagement.jsx](file:///c:/Users/darwin%20roa/restrutura/frontend/src/pages/admin/PeriodManagement.jsx)

Permite programar las fechas de los semestres académicos y activar el periodo vigente del sistema.

#### Formulario "Crear Nuevo Periodo Académico"
*   **Casilla "Nombre":** Campo de texto para ingresar la denominación (Ej. `2026-1`).
*   **Casilla "Fecha de Inicio" (Date picker):** Calendario nativo para seleccionar el día en que inicia el periodo.
*   **Casilla "Fecha de Fin" (Date picker):** Calendario nativo para seleccionar el día en que finaliza el periodo.
*   **Botón "Registrar Periodo" (Azul):** Envía los datos para crear el nuevo periodo en estado cerrado. Muestra *"Creando..."* mientras procesa.
*   **Texto de advertencia adjunto:** Aclara que el periodo se crea inactivo ("Cerrado") y que debe ser activado manualmente.

#### Tabla de Periodos Registrados
*   *Columnas:* Nombre, Inicio, Fin, Estado (Activo / Cerrado).
*   *Acciones en cada fila:*
    *   **Botón "Editar" (Azul con lápiz):** Al hacer clic, transforma las celdas de esa fila en casillas de edición de texto y fechas para modificar los datos directamente sobre la tabla sin abrir modales. Al estar en modo edición, aparecen dos botones:
        *   **Botón "Guardar" (Verde con disquete):** Guarda los cambios mediante un método `PUT` al backend.
        *   **Botón "Cancelar" (Gris con X):** Revierte los cambios y restaura la fila a su estado de lectura.
    *   **Botón "Aperturar" (Amarillo con icono de Play):**
        *   *Qué hace:* Activa el periodo seleccionado.
        *   *Mensaje de Confirmación:* Muestra un cuadro de confirmación nativo del navegador: *"¿Estás seguro de abrir este periodo? Cerrará otros periodos activos y clonará las tareas a todos los profesores."*
        *   *Lógica por debajo:* Realiza un POST al endpoint `/api/periods/{id}/open`. El backend desactiva el periodo que estaba activo anteriormente, activa el nuevo, busca a los profesores de los departamentos, y clona las tareas que tengan pendientes del periodo anterior al nuevo (lógica de Arrastre o Carry-Over).
        *   *Notificación:* Al finalizar con éxito, lanza un alert: *"✅ Periodo abierto y tareas clonadas con éxito"*.

---

### C. Gestión de Áreas de Mejora
Ubicación: [AreaManagement.jsx](file:///c:/Users/darwin%20roa/restrutura/frontend/src/pages/admin/AreaManagement.jsx)

Aquí se definen las categorías académicas bajo las cuales los profesores son evaluados y en las cuales se proponen las tareas de mejora (TIC, Didáctica, Investigación, etc.).

*   **Casilla "Nombre del Área":** Campo de texto para ingresar la nueva categoría (Ej. *"Pedagogía"*).
*   **Botón "Crear Área" (Azul):** Envía el formulario para registrar el área en la base de datos.
*   **Tabla de Áreas:**
    *   Muestra el ID y el Nombre de cada área.
    *   **Botón "Eliminar" (Rojo):** Permite borrar el área de la base de datos previa confirmación del navegador.

---

### D. Gestión de Departamentos
Ubicación: [DepartmentManagement.jsx](file:///c:/Users/darwin%20roa/restrutura/frontend/src/pages/admin/DepartmentManagement.jsx)

Asocia la estructura de facultades o departamentos del campus.

*   **Casilla "Nombre del Departamento":** Campo de texto (Ej. *"Ingeniería de Sistemas"*).
*   **Botón "Crear Departamento":** Guarda el departamento.
*   **Tabla de Departamentos:**
    *   *Acciones:* Botón para eliminar el departamento si no cuenta con dependencias activas.

---

### E. Gestión de Cursos (Materias)
Ubicación: [CourseManagement.jsx](file:///c:/Users/darwin%20roa/restrutura/frontend/src/pages/admin/CourseManagement.jsx)

*   **Casilla "Nombre del Curso":** Nombre de la materia (Ej. *"Base de Datos I"*).
*   **Casilla "Código del Curso":** Código académico único (Ej. *"IS-402"*).
*   **Desplegable "Departamento":** Selector dinámico que lista todos los departamentos creados en el sistema.
*   **Botón "Crear Curso":** Registra la asignatura.
*   **Tabla de Cursos:** Listado completo que permite buscar cursos y eliminarlos o editarlos en línea.

---

### F. Gestión de Usuarios y Roles
Ubicación en el código: [UserManagement.jsx](file:///c:/Users/darwin%20roa/restrutura/frontend/src/pages/admin/UserManagement.jsx) y [RoleManagement.jsx](file:///c:/Users/darwin%20roa/restrutura/frontend/src/pages/admin/RoleManagement.jsx)

#### Creación de Usuarios (UserManagement.jsx)
*   **Casilla "Cédula / Identificación":** Campo numérico único.
*   **Casilla "Nombre Completo":** Nombre y apellidos del docente o administrativo.
*   **Casilla "Correo Electrónico":** Email institucional del usuario.
*   **Casilla "Contraseña":** Clave temporal de acceso.
*   **Desplegable "Departamento":** Asocia al usuario a un departamento específico.
*   **Checkbox "Estado Activo":** Permite activar o suspender la cuenta del usuario de inmediato.
*   **Botón "Registrar Usuario":** Crea la cuenta.

#### Asignación de Roles (RoleManagement.jsx)
Muestra una tabla con todos los usuarios registrados y permite asignarles el rol operativo:
*   **Botones de Rol de Sistema (Admin / Director / Profesor):** Permite cambiar el rol de un usuario con un solo clic. El backend actualiza dinámicamente sus permisos de acceso y el frontend reconstruye el menú lateral de navegación de forma inmediata.

---

## 📋 3. MÓDULO DE DIRECTOR / COORDINADOR
Ubicación en el código: [pages/director/](file:///c:/Users/darwin%20roa/restrutura/frontend/src/pages/director)

Este rol lidera la evaluación de los profesores, la generación de planes de mejora con Inteligencia Artificial, y la revisión de las evidencias presentadas.

### A. Dashboard del Director
Ubicación: [DirectorDashboard.jsx](file:///c:/Users/darwin%20roa/restrutura/frontend/src/pages/director/DirectorDashboard.jsx)

Muestra estadísticas clave del departamento del director y herramientas visuales interactivas.

*   **Tarjetas de Resumen:**
    *   *Planes Generados:* Total de planes de mejora redactados en el periodo.
    *   *Tasa de Aprobación:* Porcentaje de tareas que han sido revisadas y validadas con éxito.
    *   *Profesores a Cargo:* Total de docentes adscritos al departamento del director.
*   **Gráfico Circular de Tareas:** Un gráfico de tipo donut hecho con CSS puro que muestra visualmente la proporción de tareas del departamento en estado:
    *   *Pendiente* (Gris/Rojo)
    *   *En revisión* (Amarillo/Azul claro)
    *   *Aprobada* (Verde)
*   **Mapa de Calor (Heatmap) de Áreas de Gestión:**
    *   Una matriz interactiva. Las filas son los profesores y las columnas son las Áreas de Gestión.
    *   *Funcionamiento:* Cada cuadrícula tiene un tono de color (verde) cuya intensidad depende de la cantidad de tareas que el profesor tiene asociadas y completadas en esa área. Permite al director identificar de un solo vistazo qué profesores o qué áreas de gestión tienen menor cumplimiento académico.

---

### B. Registro de Evaluaciones (Ingreso de Evaluación)
Ubicación: [EvaluationEntry.jsx](file:///c:/Users/darwin%20roa/restrutura/frontend/src/pages/director/EvaluationEntry.jsx)

Formulario fundamental donde el director ingresa las calificaciones y comentarios del docente para un curso y periodo específico. **De esta información se nutrirá la IA más adelante.**

*   **Indicador Superior "Periodo Activo":** Texto en color verde que indica sobre qué periodo académico se guardará la evaluación (extraído del periodo activo en la base de datos).
*   **Desplegable "Profesor":** Lista interactiva de los docentes adscritos al departamento.
*   **Desplegable "Curso":** Lista de asignaturas asociadas al departamento seleccionado.
*   **Casilla "Nota de Autoevaluación (Estudiantes)" (Input Numérico):** Calificación numérica de 0.0 a 5.0 dada por los alumnos en la encuesta docente.
*   **Casilla "Nota de Coevaluación (Director)" (Input Numérico):** Calificación numérica de 0.0 a 5.0 asignada directamente por el director.
*   **Casilla "Comentarios Cualitativos y Hallazgos" (Textarea):**
    *   *Qué hace:* Caja de texto libre y multilínea.
    *   *Importancia:* Aquí el director debe detallar las oportunidades de mejora observadas (Ej. *"El docente presenta debilidades en el manejo de herramientas de aula virtual y la entrega a tiempo de las calificaciones, aunque metodológicamente es excelente"*). Este texto es el insumo principal (prompt) que el motor de IA de Google Gemini leerá para diseñar las tareas personalizadas.
*   **Botón "Guardar Evaluación" (Verde):** Registra la evaluación en la base de datos.
    *   *Alertas de validación:* Si las notas no están en el rango de 0 a 5 o si faltan campos, se muestran advertencias interactivas.

---

### C. Generación de Planes con IA (El Botón Mágico)
Ubicación: [GeneratePlan.jsx](file:///c:/Users/darwin%20roa/restrutura/frontend/src/pages/director/GeneratePlan.jsx)

Pantalla dedicada a la automatización de planes de mejora mediante inteligencia artificial masiva. Evita la redacción manual de decenas de planes individuales.

*   **Tabla de Profesores Pendientes:** Muestra a los docentes que tienen evaluaciones registradas en el periodo actual pero que aún no disponen de un plan de mejora estructurado.
*   **Checkboxes de Selección Masiva (Casillas de Verificación):**
    *   *Casilla superior en cabecera:* Selecciona o deselecciona a todos los profesores listados con un solo clic.
    *   *Casillas individuales por fila:* Permite seleccionar profesores específicos.
*   **Botón "Generar Planes para Seleccionados" (Verde con icono de Bot/IA):**
    *   *Qué hace:* Inicia el proceso de consulta a la API de Inteligencia Artificial (Google Gemini).
    *   *Funcionamiento asíncrono y en lotes:* Envía las peticiones agrupadas de dos en dos para prevenir errores de saturación (Rate Limits - Error 429).
    *   *Barra de Progreso:* Aparece un contenedor visual con una barra de carga dinámica que se llena porcentualmente a medida que la IA responde con las propuestas de planes.
    *   *Notificación Final:* Una vez completada la barra, se muestra un banner de confirmación con el resumen: *"Se generaron exitosamente X planes de mejora. Puedes revisarlos en el listado de planes."*

---

### D. Gestión de Planes de Mejora (Auditoría Humana y Aprobación)
Ubicación: [PlanesMejora.jsx](file:///c:/Users/darwin%20roa/restrutura/frontend/src/pages/director/PlanesMejora.jsx)

Permite auditar los borradores que creó la IA antes de que sean visibles para los profesores.

*   **Tabla de Planes:** Muestra el nombre del profesor, fecha de creación, porcentaje de progreso de tareas y el estado del plan:
    *   `Borrador`: Creado por la IA, invisible para el profesor.
    *   `Aprobado`: Validado por el director, visible y activo para el profesor.
*   **Botón "Ver Detalle / Editar" (Azul en la fila del plan):** Abre el panel de edición detallada del plan seleccionado.
*   **Panel de Edición del Plan (Dentro del detalle):**
    *   *Métricas globales del plan:* Promedios del docente y estado general.
    *   *Listado de Tareas Propuestas por la IA:* Cada tarea se muestra en una fila con su descripción, área asociada, entregable sugerido y fecha límite.
    *   *Acciones en cada tarea:*
        *   **Botón "Editar Tarea":** Permite cambiar los textos de la tarea o reprogramar la fecha límite.
        *   **Botón "Eliminar Tarea" (Icono de papelera):** Elimina por completo esa propuesta de tarea si el director considera que no aplica.
        *   **Botón "Agregar Tarea Manual" (Botón superior):** Abre un modal para escribir una tarea desde cero de forma manual.
    *   **Botón "Aprobar Plan" (Botón principal verde superior):**
        *   *Qué hace:* Cambia el estado del plan de `Borrador` a `Aprobado`.
        *   *Efecto:* A partir de este momento, el profesor puede visualizar su plan de mejora y comenzar a subir evidencias en su propio portal.

---

### E. Bandeja de Evidencias (Auditoría de Entregas)
Ubicación: [BandejaEvidencias.jsx](file:///c:/Users/darwin%20roa/restrutura/frontend/src/pages/director/BandejaEvidencias.jsx)

Es el centro de control donde llegan todos los soportes y archivos cargados por los profesores para demostrar el cumplimiento de sus tareas.

*   **Tabla de Evidencias en Revisión:**
    *   *Fila:* Profesor, Tarea, Comentario del Profesor, Archivo / Link.
    *   *Acciones:*
        *   **Botón "Ver Archivo / Abrir Link":** Abre en una pestaña nueva el documento adjunto o el enlace de Google Drive proporcionado por el profesor.
        *   **Casilla "Retroalimentación / Comentarios del Evaluador" (Input de Texto):** Espacio donde el director escribe observaciones sobre la entrega (Ej. *"El certificado cumple con las horas requeridas"*).
        *   **Botón "Aprobar Evidencia" (Verde con check):**
            *   *Qué hace:* Cambia el estado de la tarea a *Aprobada*.
            *   *Lógica:* Incrementa automáticamente el porcentaje de avance general del plan del profesor.
        *   **Botón "Rechazar Evidencia" (Rojo con X):**
            *   *Qué hace:* Devuelve la tarea al estado *Pendiente*.
            *   *Lógica:* Envía el comentario de retroalimentación al profesor para que este corrija la evidencia y vuelva a subirla.

---

### F. Historial de Evolución (Comparativa Multianual)
Ubicación: [HistorialEvolucion.jsx](file:///c:/Users/darwin%20roa/restrutura/frontend/src/pages/director/HistorialEvolucion.jsx)

Dashboard de analítica avanzada que calcula el progreso de los docentes a lo largo del tiempo cruzando la información de múltiples periodos.

*   **Desplegable "Seleccionar Periodo de Referencia":** Permite escoger qué periodo se desea analizar como base. El sistema buscará de manera automática el periodo previo inmediato para realizar los cálculos comparativos de rendimiento.
*   **Métricas de Tendencia Comparativa:**
    *   *Profesores que Mejoraron:* Docentes cuya nota promedio del periodo de referencia es superior a la del periodo anterior.
    *   *Profesores Estables:* Mantienen el mismo promedio.
    *   *Profesores que Empeoraron:* Bajaron su promedio de calificación.
*   **Tabla Comparativa Detallada:** Muestra una lista de todos los docentes del departamento con las columnas:
    *   *Profesor.*
    *   *Nota Periodo Anterior.*
    *   *Nota Periodo Evaluado.*
    *   *Diferencia:* Un indicador visual. Si es positiva, muestra una flecha verde hacia arriba y el valor (Ej. `+0.4 ▲`). Si es negativa, muestra una flecha roja hacia abajo (Ej. `-0.8 ▼`).

---

### G. Exportar Planes de Trabajo y Reportes
Ubicación: [ExportarDirector.jsx](file:///c:/Users/darwin%20roa/restrutura/frontend/src/pages/director/ExportarDirector.jsx) y [PlanTrabajo.jsx](file:///c:/Users/darwin%20roa/restrutura/frontend/src/pages/director/PlanTrabajo.jsx)

*   **Listado de Planes del Periodo:**
    *   **Botón "Exportar PDF" (Icono de archivo rojo):** Invoca el endpoint del servidor `/api/planes/{id}/exportar-pdf` el cual renderiza el plan completo en un documento PDF membretado y estructurado listo para impresión o firma digital institucional.

---

## 👨‍🏫 4. MÓDULO DE PROFESOR (Ejecución y Soportes)
Ubicación en el código: [pages/profesor/](file:///c:/Users/darwin%20roa/restrutura/frontend/src/pages/profesor)

El profesor dispone de una interfaz simplificada y enfocada en la visualización de sus metas y la carga de sus soportes.

### A. Dashboard del Profesor
Ubicación: [ProfesorDashboard.jsx](file:///c:/Users/darwin%20roa/restrutura/frontend/src/pages/profesor/ProfesorDashboard.jsx)

#### Resumen de Calificaciones y Progreso
*   **Tarjeta "Mi Calificación Promedio":** Muestra el promedio acumulado de sus evaluaciones del periodo activo.
*   **Barra de Progreso del Plan (Progreso General):** Una barra visual horizontal verde con el porcentaje de tareas completadas y aprobadas por el director en el ciclo vigente (Ej. `45% completado`).

#### Sección "Mis Tareas Pendientes y Plan de Mejora"
Muestra el listado de tareas asignadas al profesor para el periodo actual.
*   *Indicadores de Tarea:*
    *   **Área de Gestión asociada:** (Ej. *TIC*, *Pedagogía*).
    *   **Descripción de la tarea:** Qué debe hacer el docente.
    *   **Entregable requerido:** Qué debe presentar como evidencia (Ej. *"Certificado en PDF"*).
    *   **Fecha límite:** Plazo máximo de entrega en formato YYYY-MM-DD.
    *   **Etiqueta de "Arrastrada" (Carry Over) (Indicador visual en color rojo):** Si la tarea proviene de un periodo anterior no superado, se muestra resaltada con el texto *"⚠ Tarea Arrastrada de periodos anteriores"* y el contador de veces que ha sido arrastrada.
    *   **Estado actual de la tarea:** Muestra etiquetas de colores según el estado:
        *   `Pendiente`: El profesor no ha subido soporte.
        *   `En Revisión`: Soporte subido, esperando aprobación del director.
        *   `Aprobada`: Validada con éxito.
        *   `Rechazada`: Devuelta por el director con observaciones.

#### Modal / Ventana Emergente "Subir Soporte de Evidencia"
Se activa al hacer clic en el **Botón "Subir Evidencia"** al lado de cualquier tarea pendiente o rechazada.
*   **Casilla "Adjuntar Archivo" (Input File):** Permite buscar y seleccionar archivos locales en formato PDF, Word, o imágenes (límite establecido por el servidor).
*   **Casilla "Enlace / Link" (Input URL):** Permite escribir o pegar un enlace web (Ej. carpeta compartida de OneDrive o Google Drive, portafolio digital, publicación científica).
*   **Casilla "Comentarios del Profesor" (Textarea):** Campo para redactar una nota breve aclaratoria dirigida al director que revisará la entrega.
*   **Botón "Enviar Evidencia" (Verde):** Carga los datos al servidor y actualiza el estado de la tarea de inmediato a *En Revisión*.
*   **Botón "Cancelar" (Gris):** Cierra el modal sin guardar cambios.
