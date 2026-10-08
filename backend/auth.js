const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

module.exports = (pool) => {

  router.post('/register', async (req, res) => {
    try {
      const { nombre, email, password, rol } = req.body;

      if (!nombre || !email || !password || !rol) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
      }

      const passwordSegura = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(password);
      if (!passwordSegura) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres, incluyendo letras y números' });
      }

      const password_hash = await bcrypt.hash(password, 10);

      const [result] = await pool.query(
        'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)',
        [nombre, email, password_hash, rol]
      );

      res.status(201).json({ mensaje: 'Usuario creado correctamente', id: result.insertId });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Ese email ya está registrado' });
      }
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);

      if (rows.length === 0) {
        return res.status(401).json({ error: 'Email o contraseña incorrectos' });
      }

      const usuario = rows[0];
      const passwordCorrecta = await bcrypt.compare(password, usuario.password_hash);

      if (!passwordCorrecta) {
        return res.status(401).json({ error: 'Email o contraseña incorrectos' });
      }

      const token = jwt.sign(
        { id: usuario.id, rol: usuario.rol, nombre: usuario.nombre },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      res.json({
        mensaje: 'Login exitoso',
        token,
        usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};