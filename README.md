# Sistema de Gestión de Planes de Mejora Profesoral

Este proyecto es una plataforma web para la gestión, seguimiento y evaluación de los Planes de Mejora Profesoral. Está dividido en dos partes principales: un **Backend** desarrollado en PHP (Laravel) y un **Frontend** desarrollado en React (Vite).

## Requisitos Previos

Antes de ejecutar el proyecto, asegúrese de tener instalado:
- **PHP** (v8.1 o superior) y **Composer**.
- **Node.js** (v16 o superior) y **npm**.
- **MySQL** o MariaDB (XAMPP, WAMP, o similar).

## Configuración y Ejecución del Backend (API)

1. Abra una terminal y navegue a la carpeta del backend:
   ```bash
   cd backend-php
   ```
2. Instale las dependencias de PHP:
   ```bash
   composer install
   ```
3. Copie el archivo de entorno y genere la clave de la aplicación:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
4. Configure las credenciales de su base de datos local en el archivo `.env` del backend (asegúrese de crear una base de datos vacía en MySQL primero).
5. Ejecute las migraciones y los seeders para poblar la base de datos con los datos iniciales y usuarios de prueba:
   ```bash
   php artisan migrate:fresh --seed
   ```
6. Inicie el servidor de desarrollo de Laravel:
   ```bash
   php artisan serve
   ```
   *El servidor correrá por defecto en `http://127.0.0.1:8000`*

## Configuración y Ejecución del Frontend (React)

1. Abra una **nueva terminal** y navegue a la carpeta del frontend:
   ```bash
   cd frontend
   ```
2. Instale las dependencias de Node:
   ```bash
   npm install
   ```
3. Inicie el servidor de desarrollo de Vite:
   ```bash
   npm run dev
   ```
4. Abra su navegador en la dirección que le indique Vite (usualmente `http://localhost:5173`).

---
**Nota:** El sistema ya viene con usuarios de prueba configurados por el `DatabaseSeeder` para los diferentes roles (Administrador, Director y Profesor).
