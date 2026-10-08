const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

module.exports = (pool) => {
  router.get('/', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT id, nombre, email, rol FROM usuarios');
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Restablecer la contraseña de un usuario interno (uso interno: admin)
  router.patch('/:id/password', async (req, res) => {
    try {
      const { password } = req.body;
      const passwordSegura = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(password || '');
      if (!passwordSegura) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres, incluyendo letras y números' });
      }
      const password_hash = await bcrypt.hash(password, 10);
      await pool.query('UPDATE usuarios SET password_hash = ? WHERE id = ?', [password_hash, req.params.id]);
      res.json({ mensaje: 'Contraseña restablecida' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.delete('/:id', async (req, res) => {
    try {
      await pool.query('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
      res.json({ mensaje: 'Usuario eliminado' });
    } catch (error) {
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ error: 'No se puede eliminar: este usuario tiene órdenes asociadas.' });
      }
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};