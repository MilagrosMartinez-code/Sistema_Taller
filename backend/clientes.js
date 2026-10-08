const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

module.exports = (pool) => {

  router.get('/', async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT c.*,
          (SELECT COUNT(*) FROM ordenes_trabajo o
           JOIN vehiculos v ON o.vehiculo_id = v.id
           WHERE v.cliente_id = c.id AND o.estado_actual IN ('Finalizado', 'Entregado')) AS visitas
        FROM clientes c
        WHERE c.oculto = 0 OR c.oculto IS NULL
        ORDER BY c.id DESC
      `);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/', async (req, res) => {
    try {
      const { nombre, telefono, email } = req.body;
      if (!nombre) {
        return res.status(400).json({ error: 'El nombre es obligatorio' });
      }
      const [result] = await pool.query(
        'INSERT INTO clientes (nombre, telefono, email) VALUES (?, ?, ?)',
        [nombre, telefono || null, email || null]
      );
      res.status(201).json({ id: result.insertId, nombre, telefono, email });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.put('/:id', async (req, res) => {
    try {
      const { nombre, telefono, email } = req.body;
      await pool.query(
        'UPDATE clientes SET nombre = ?, telefono = ?, email = ? WHERE id = ?',
        [nombre, telefono || null, email || null, req.params.id]
      );
      res.json({ mensaje: 'Cliente actualizado' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Restablecer la contraseña de un cliente (uso interno: admin o vendedor)
  router.patch('/:id/password', async (req, res) => {
    try {
      const { password } = req.body;
      const passwordSegura = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(password || '');
      if (!passwordSegura) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres, incluyendo letras y números' });
      }
      const password_hash = await bcrypt.hash(password, 10);
      await pool.query('UPDATE clientes SET password_hash = ? WHERE id = ?', [password_hash, req.params.id]);
      res.json({ mensaje: 'Contraseña restablecida' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.delete('/:id', async (req, res) => {
    try {
      await pool.query('UPDATE clientes SET oculto = 1 WHERE id = ?', [req.params.id]);
      res.json({ mensaje: 'Cliente eliminado' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};