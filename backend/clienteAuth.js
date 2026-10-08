const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

module.exports = (pool) => {

  router.get('/prefill/:codigo', async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT c.id, c.nombre, c.email, c.telefono, c.password_hash
        FROM ordenes_trabajo o
        JOIN vehiculos v ON o.vehiculo_id = v.id
        JOIN clientes c ON v.cliente_id = c.id
        WHERE o.codigo_unico = ?
      `, [req.params.codigo]);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Orden no encontrada' });
      }
      const c = rows[0];
      res.json({
        cliente_id: c.id,
        nombre: c.nombre,
        email: c.email,
        telefono: c.telefono,
        yaRegistrado: !!c.password_hash
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/registro', async (req, res) => {
    console.log('1. Petición recibida:', req.body);
    try {
      const { cliente_id, password } = req.body;
      if (!cliente_id || !password) {
        return res.status(400).json({ error: 'Faltan datos obligatorios' });
      }

      const passwordSegura = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(password);
      if (!passwordSegura) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres, incluyendo letras y números' });
      }
      console.log('2. Validaciones OK, buscando cliente...');

      const [rows] = await pool.query('SELECT id, password_hash FROM clientes WHERE id = ?', [cliente_id]);
      console.log('3. Cliente encontrado:', rows);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }
      if (rows[0].password_hash) {
        return res.status(400).json({ error: 'Este cliente ya tiene una cuenta creada' });
      }

      console.log('4. Encriptando contraseña...');
      const password_hash = await bcrypt.hash(password, 10);
      console.log('5. Contraseña encriptada, guardando en la base...');

      await pool.query('UPDATE clientes SET password_hash = ? WHERE id = ?', [password_hash, cliente_id]);
      console.log('6. Guardado con éxito');

      res.status(201).json({ mensaje: 'Cuenta creada correctamente' });
    } catch (error) {
      console.log('ERROR ATRAPADO:', error.message);
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      const [rows] = await pool.query('SELECT * FROM clientes WHERE email = ?', [email]);
      if (rows.length === 0 || !rows[0].password_hash) {
        return res.status(401).json({ error: 'Email o contraseña incorrectos' });
      }

      const cliente = rows[0];
      const passwordCorrecta = await bcrypt.compare(password, cliente.password_hash);
      if (!passwordCorrecta) {
        return res.status(401).json({ error: 'Email o contraseña incorrectos' });
      }

      const token = jwt.sign(
        { id: cliente.id, rol: 'cliente', nombre: cliente.nombre },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      res.json({
        mensaje: 'Login exitoso',
        token,
        cliente: { id: cliente.id, nombre: cliente.nombre }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};