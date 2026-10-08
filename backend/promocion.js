const express = require('express');
const router = express.Router();
const verificarToken = require('./authMiddleware');

module.exports = (pool) => {

  router.get('/', async (req, res) => {
    try {
      const [rows] = await pool.query('SELECT * FROM configuracion_promocion WHERE id = 1');
      res.json(rows[0] || { activa: 0, visitas_requeridas: 10, descripcion: '' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.put('/', verificarToken, async (req, res) => {
    try {
      if (req.usuario.rol !== 'admin') {
        return res.status(403).json({ error: 'Solo el administrador puede modificar la promoción' });
      }
      const { activa, visitas_requeridas, descripcion } = req.body;
      await pool.query(
        'UPDATE configuracion_promocion SET activa = ?, visitas_requeridas = ?, descripcion = ? WHERE id = 1',
        [activa ? 1 : 0, visitas_requeridas, descripcion]
      );
      res.json({ mensaje: 'Promoción actualizada' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};