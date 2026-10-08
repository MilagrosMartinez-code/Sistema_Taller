require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const authRoutes = require('./auth');
const clientesRoutes = require('./clientes');
const vehiculosRoutes = require('./vehiculos');
const ordenesRoutes = require('./ordenes');
const usuariosRoutes = require('./usuarios');
const clienteAuthRoutes = require('./clienteAuth');
const promocionRoutes = require('./promocion');
const verificarToken = require('./authMiddleware');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

app.use('/api', authRoutes(pool));
app.use('/api/clientes', verificarToken, clientesRoutes(pool));
app.use('/api/vehiculos', verificarToken, vehiculosRoutes(pool));
app.use('/api/ordenes', ordenesRoutes(pool));
app.use('/api/usuarios', verificarToken, usuariosRoutes(pool));
app.use('/api/cliente-auth', clienteAuthRoutes(pool));
app.use('/api/promocion', promocionRoutes(pool));

app.get('/', (req, res) => {
  res.json({ mensaje: 'Backend del sistema de taller funcionando' });
});

app.get('/api/test-db', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS resultado');
    res.json({ conexion: 'ok', resultado: rows[0].resultado });
  } catch (error) {
    res.status(500).json({ conexion: 'error', mensaje: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});