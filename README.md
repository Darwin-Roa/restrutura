# 🚀 Sistema de Gestión de Planes de Mejora Profesoral

![Estado](https://img.shields.io/badge/Estado-Finalizado-success)
![Versión](https://img.shields.io/badge/Versi%C3%B3n-1.0.0-blue)
![React](https://img.shields.io/badge/Frontend-React_Vite-61DAFB?logo=react)
![Laravel](https://img.shields.io/badge/Backend-Laravel_PHP-FF2D20?logo=laravel)

Plataforma web integral diseñada para la gestión, seguimiento, auditoría y evaluación de los **Planes de Mejora Profesoral**. Esta herramienta permite digitalizar y centralizar el proceso de seguimiento académico, facilitando la comunicación entre Profesores, Directores de Programa y Administradores, además de contar con integración de Inteligencia Artificial para el análisis de retroalimentación.

---

## ⚙️ Características Principales

- **🛡️ Gestión de Roles:** Panel especializado con diferentes niveles de acceso (Administrador, Director y Profesor).
- **🤖 Copilot IA:** Integración con Inteligencia Artificial para generar análisis automáticos y sugerencias sobre las evaluaciones estudiantiles.
- **📊 Dashboard Interactivo:** Visualización del progreso de los docentes en tiempo real, incluyendo un "Heatmap" (Mapa de Calor) de tareas completadas por áreas de gestión.
- **📁 Auditoría de Evidencias:** Sistema para que los profesores adjunten evidencias (archivos, enlaces, respuestas) y los directores puedan revisarlas, aprobadas o rechazadas.
- **📄 Generación de PDFs:** Exportación automática de cartas de compromiso y planes de mejora estructurados listos para imprimir o guardar, con firmas digitales integradas.
- **⚙️ Configuración Dinámica:** Panel administrativo para gestionar periodos activos, cursos, departamentos y áreas institucionales.

---

## 📂 Documentación del Proyecto

El proyecto cuenta con documentación detallada que se renderiza directamente en GitHub:

- 🎯 [**Guía Rápida: Relación de Roles y Botones**](file:///c:/Users/darwin%20roa/restrutura/docs/GUIA_RAPIDA_ROLES_Y_BOTONES.md): Resumen visual y directo de cómo se conectan los tres roles en el ciclo del periodo, junto con un diccionario de qué hace cada botón en el sistema.
- 🤖 [**Guía de Configuración de IA**](file:///c:/Users/darwin%20roa/restrutura/docs/COMO_CAMBIAR_API_IA.md): Explicación paso a paso de cómo configurar y alternar el proveedor de IA (Gemini o ChatGPT) y sus claves de API en el archivo `.env`.
- 📖 [**Manual de Usuario e Interfaz Detallado**](file:///c:/Users/darwin%20roa/restrutura/docs/manual_completo.md): Guía paso a paso, click por click y botón por botón para cada uno de los roles (Administrador, Director y Profesor).
- 🧠 [**Documentación Técnica y Funcional**](file:///c:/Users/darwin%20roa/restrutura/docs/documentacion_tecnica.md): Explicación detallada del funcionamiento interno, la comunicación Axios/Sanctum, la lógica de la IA con Gemini (limites de peticiones por lotes), el algoritmo de Arrastre (Carry-over) y exportación PDF.

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Framework:** React + Vite
- **Estilos:** Tailwind CSS
- **Íconos:** Lucide React
- **Peticiones HTTP:** Axios

### Backend
- **Framework:** Laravel (PHP 8+)
- **Base de Datos:** MySQL / MariaDB
- **Autenticación:** Laravel Sanctum (Tokens JWT)
- **Generación de PDFs:** Barryvdh/Laravel-DomPDF

---

## ⚙️ Requisitos Previos

Asegúrese de contar con las siguientes herramientas instaladas en su entorno local:
- [PHP](https://www.php.net/) >= 8.1
- [Composer](https://getcomposer.org/)
- [Node.js](https://nodejs.org/) >= 16.x y npm
- Servidor de base de datos MySQL (por ejemplo: XAMPP, WAMP, Laragon, etc.)

---

## 🚀 Instalación y Configuración

El proyecto está dividido en dos directorios principales: `backend-php` y `frontend`. Siga los pasos a continuación para ejecutar ambos entornos.

### 1. Configuración del Backend (API)

1. Abra una terminal y navegue a la carpeta del backend:
   ```bash
   cd backend-php
   ```
2. Instale las dependencias de PHP:
   ```bash
   composer install
   ```
3. Configure su archivo de entorno:
   ```bash
   cp .env.example .env
   ```
4. Genere la clave de seguridad de Laravel:
   ```bash
   php artisan key:generate
   ```
5. **Base de datos e Inteligencia Artificial:** Cree una base de datos vacía en MySQL. Luego, actualice las credenciales y su API Key de Gemini en su archivo `.env`:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=nombre_de_su_base_de_datos
   DB_USERNAME=root
   DB_PASSWORD=

   # Inteligencia Artificial (Google Gemini)
   GEMINI_API_KEY="su_clave_api_de_google_gemini_aqui"
   ```
6. **IMPORTANTE - Base de Datos:** Para evitar errores de sincronización con las nuevas tablas de IA, **NO ejecute `php artisan migrate`**. 
   - Por favor, importe directamente el archivo `.sql` adjunto a esta entrega dentro de su gestor de base de datos (phpMyAdmin).
   - Este archivo ya contiene toda la estructura final, relaciones y los datos de prueba listos para funcionar.
7. Inicie el servidor de desarrollo:
   ```bash
   php artisan serve
   ```
   *(La API estará disponible en `http://127.0.0.1:8000`)*

### 2. Configuración del Frontend (React)

1. Abra una **nueva terminal** y navegue a la carpeta del frontend:
   ```bash
   cd frontend
   ```
2. Instale las dependencias de Node:
   ```bash
   npm install
   ```
3. **Variables de Entorno (IMPORTANTE):** Cree un archivo `.env` en la carpeta `frontend` y especifique la ruta pública de su backend:
   ```env
   VITE_API_URL=https://su-dominio.com/backend-php/public/api
   
   # O si está en su computadora local (desarrollo):
   # VITE_API_URL=http://127.0.0.1:8000/api
   ```
4. Para probarlo en modo desarrollo:
   ```bash
   npm run dev
   ```
5. **Para Producción (Despliegue final):** Compile el proyecto con:
   ```bash
   npm run build
   ```
   *Esto generará la carpeta `dist/` con los archivos finales listos para subirse al servidor.*

---

## 🔐 Cuentas de Prueba

El comando `migrate:fresh --seed` ejecutado anteriormente genera usuarios de prueba para que pueda explorar rápidamente todos los perfiles de la plataforma. Puede iniciar sesión con cualquiera de las siguientes credenciales:

| Rol | Correo Electrónico | Contraseña |
| --- | --- | --- |
| **Administrador** | `admin@unisimon.edu.co` | `123456` |
| **Director / Coordinador** | `director@unisimon.edu.co` | `123456` |
| **Profesor** | `profesor@unisimon.edu.co` | `123456` |

*(La contraseña por defecto para todos los usuarios semilla es `123456`)*

---

## 🏗️ Estructura del Proyecto

```text
/
├── backend-php/        # API RESTful en Laravel
│   ├── app/            # Controladores, Modelos, Servicios y Middleware
│   ├── database/       # Migraciones y Seeders (datos iniciales de prueba)
│   ├── routes/         # Rutas de la API (api.php)
│   └── public/         # Archivos públicos y almacenamiento de evidencias/firmas
│
└── frontend/           # Aplicación web de una sola página (SPA) en React
    ├── src/
    │   ├── api/        # Interceptores y configuración de Axios
    │   ├── components/ # Componentes reutilizables, modales y menús
    │   ├── hooks/      # Hooks personalizados (autenticación)
    │   └── pages/      # Vistas completas divididas por roles
    └── index.html
```

---
*Desarrollado para optimizar la calidad académica y facilitar el proceso de gestión institucional.*
 

