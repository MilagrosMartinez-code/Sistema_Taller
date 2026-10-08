-- Sistema de Taller — Estructura completa de la base de datos
-- Generar la base con: CREATE DATABASE sistema_taller; USE sistema_taller;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'tecnico', 'vendedor', 'cliente') NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  telefono VARCHAR(20),
  email VARCHAR(100),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vehiculos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  marca VARCHAR(50) NOT NULL,
  modelo VARCHAR(50) NOT NULL,
  anio INT,
  chasis VARCHAR(50),
  placa VARCHAR(20),
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

CREATE TABLE ordenes_trabajo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehiculo_id INT NOT NULL,
  tecnico_id INT,
  codigo_unico VARCHAR(20) NOT NULL UNIQUE,
  estado_actual ENUM('En Cola', 'En Proceso', 'Finalizado', 'Entregado', 'Cancelado') DEFAULT 'En Cola',
  fecha_ingreso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_estim_entrega DATE,
  descripcion TEXT,
  servicio VARCHAR(50),
  costo DECIMAL(12,2),
  oculto TINYINT(1) NOT NULL DEFAULT 0,
  FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id),
  FOREIGN KEY (tecnico_id) REFERENCES usuarios(id)
);

CREATE TABLE historial_estados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  orden_id INT NOT NULL,
  usuario_id INT,
  estado VARCHAR(50) NOT NULL,
  fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  comentario TEXT,
  FOREIGN KEY (orden_id) REFERENCES ordenes_trabajo(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);