# Sistema de Taller

Sistema web de control y seguimiento en tiempo real de vehículos para talleres automotrices — desarrollado como proyecto de tesis (Ingeniería en Informática).

## Tecnologías

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Base de datos:** MySQL
- **Autenticación:** JWT + bcrypt

## Requisitos previos

- Node.js instalado
- XAMPP (o MySQL + phpMyAdmin) corriendo

## Instalación

### 1. Base de datos
Crear la base `sistema_taller` en phpMyAdmin y ejecutar el archivo `schema.sql` en la pestaña SQL.

### 2. Backend

cd backend
npm install
node index.js

Crear un archivo `.env` dentro de `backend` con:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=sistema_taller
DB_PORT=3306
PORT=5000
JWT_SECRET=clave_secreta_2026


### 3. Frontend

cd frontend
npm install
npm run dev


## Roles del sistema

- **Administrador:** control total, usuarios, dashboard.
- **Vendedor:** carga clientes, vehículos y crea órdenes.
- **Técnico:** actualiza el estado de sus trabajos asignados.
- **Cliente:** accede sin login mediante un link/QR único por orden.

## Rutas públicas (sin autenticación)

- `/seguimiento/:codigo` — seguimiento del cliente
- `/totem` — pantalla pública de estado en vivo