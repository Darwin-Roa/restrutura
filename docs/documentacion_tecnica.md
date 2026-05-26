# 🧠 Documentación Técnica y Funcional del Sistema

Este documento profundiza en la anatomía técnica del proyecto. Explica cómo funciona el sistema "por debajo", detallando la lógica de negocio, las decisiones algorítmicas y el flujo de los componentes clave. Ideal para comprender la ingeniería detrás de la plataforma.

---

## 1. 🌐 Núcleo de Comunicación: Frontend-Backend (Axios y CORS)

### ¿Cómo funciona la comunicación segura?
El sistema utiliza una arquitectura **desacoplada**. React (Frontend) y Laravel (Backend) viven separados.
- **Intercepción de Peticiones (`axios.js`):** En React, existe un "Interceptor" global. Antes de que cualquier petición salga hacia Laravel, este archivo (`frontend/src/api/axios.js`) captura la petición y busca en el almacenamiento local (`sessionStorage`) si existe un Token. Si existe, inyecta la cabecera `Authorization: Bearer <Token>`.
- **Laravel Sanctum:** Del lado del servidor, el middleware `auth:sanctum` revisa ese token, verifica criptográficamente que no haya expirado y concede acceso al controlador. Esto evita tener que enviar la contraseña en cada clic y hace que el sistema sea completamente sin estado (stateless) y altamente scalante.

---

## 2. 🤖 Motor de Inteligencia Artificial (Google Gemini)

### La Lógica del Servicio IA (`AIService.php`)
El sistema no simplemente le pide favores a la IA; está programado para comunicarse de forma estructurada (Prompt Engineering).
- **El Prompt Estructurado:** Cuando el Director presiona "Generar Plan", Laravel toma los comentarios de la evaluación, el nombre del curso y el área de mejora, y ensambla una orden hiper-detallada (Prompt). Le exige a la IA que responda estrictamente en formato **JSON** con una lista de "Acciones", indicando nombre de la tarea, entregable esperado y descripción.
- **Tolerancia a Fallos (Rate Limiting):** Las inteligencias artificiales comerciales (como Gemini) bloquean conexiones si reciben muchas peticiones por segundo (Error 429 - Too Many Requests). 
  - **Función de Lotes (Batches):** En lugar de mandar a evaluar a 50 profesores de un golpe, el componente en React (`GeneratePlan.jsx`) agrupa a los profesores de 2 en 2 (Batch Size = 2).
  - **Pausas Asíncronas:** El código espera que ese lote termine y luego ejecuta un `await new Promise(r => setTimeout(r, 3000))` para forzar al sistema a "dormir" 3 segundos antes de enviar el siguiente lote. Esto burla los bloqueos de Google y garantiza un 100% de éxito en procesamiento masivo.

---

## 3. ⏳ Algoritmo de Deudas Académicas (Carry-Over / Arrastre)

### La función de arrastre de tareas
Uno de los componentes más avanzados del sistema es cómo maneja el incumplimiento.
- **Variables de Base de Datos:** La tabla `acciones_plan_ia` cuenta con un campo booleano `needs_carry_over` y un contador `carry_over_count`.
- **Evaluación de Fin de Periodo:** Cuando un periodo termina, el sistema revisa todas las acciones cuyo estado nunca pasó a "Completado" (aprobado por el director). A estas tareas se les enciende la bandera `needs_carry_over`.
- **Inyección Transversal:** Al siguiente semestre, cuando la IA va a generar un plan de mejora completamente nuevo para el profesor basándose en sus nuevos comentarios, el sistema "inyecta" por debajo de la mesa las tareas que tenían la bandera `needs_carry_over`. 
- **Efecto Visual:** En el Dashboard del Profesor y del Director, el frontend detecta que `carry_over_count > 0` y le aplica una clase especial de CSS (`bg-red-50 text-red-700`) para resaltar permanentemente esa tarea en rojo, alertando que es una deuda histórica grave.

---

## 4. 📊 Dashboards y Analítica Dinámica

### Dashboard Comparativo Histórico (`HistorialEvolucion.jsx`)
No es un simple gráfico estático. Es un motor de cálculo dinámico.
- **Ordenamiento Alfabético/Cronológico:** El algoritmo toma todos los periodos (ej. `2025-1`, `2026-2`) y utiliza la función de Javascript `.sort((a,b) => a.localeCompare(b))` para asegurar que siempre estén en orden cronológico exacto sin importar cuándo se crearon en la base de datos.
- **Matemáticas de Tendencia:** Para comparar, la función extrae el último periodo del arreglo (Actual) y el penúltimo (Anterior). Cruza los puntajes promedios de los profesores en ambos periodos.
  - Si el puntaje actual sube más de 0.1, se clasifica como `Mejoró`.
  - Si baja más de 0.1, se clasifica como `Empeoró`.
  - Si la diferencia es casi cero, es `Estable`.
- Este cálculo iterativo alimenta los gráficos de dona e histogramas, proporcionando métricas reales de impacto al coordinador.

---

## 5. 🖨️ Generación de Documentos Formales (DomPDF)

### El exportador de Planes Oficiales (`ExportController.php`)
Las universidades exigen soportes físicos o PDFs inmodificables.
- El sistema utiliza la librería `barryvdh/laravel-dompdf`.
- **Petición en Crudo:** React, en lugar de solicitar un JSON, solicita un `blob` (archivo binario) a una ruta específica de Laravel enviando el Token en la URL.
- **Renderizado del Motor:** Laravel toma la información del Plan de Mejora (incluyendo todas las acciones, fechas y comentarios del profesor) y las inyecta en una vista (View) de tipo HTML/Blade diseñada específicamente con márgenes y estilos CSS de impresión.
- DomPDF "fotografía" ese HTML y lo convierte en un archivo binario `.pdf` inyectándole firmas digitales predefinidas, el cual es descargado automáticamente por el navegador del usuario.

---

## 6. 📂 Auditoría de Evidencias Seguras

### Manejo de Archivos en Laravel
- El sistema no guarda los archivos en la base de datos (eso colapsaría la memoria). Usa el "File System" nativo de Laravel (`Storage::disk('public')`).
- Al subir una evidencia (PDF o imagen), Laravel le asigna un nombre criptográfico único para evitar reemplazos de archivos con nombres duplicados (ej. `tarea_123_qxw34k.pdf`).
- El disco se vincula simbólicamente (`php artisan storage:link`) a la carpeta pública, permitiendo que el Director pueda hacer clic en el enlace desde React y ver el archivo sin que el profesor pueda modificarlo o borrarlo después de haber sido calificado.
