const express = require('express');
const router = express.Router();

module.exports = (pool) => {

  router.get('/', async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT v.*, c.nombre AS cliente_nombre
        FROM vehiculos v
        JOIN clientes c ON v.cliente_id = c.id
        WHERE v.oculto = 0 OR v.oculto IS NULL
        ORDER BY v.id DESC
      `);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/', async (req, res) => {
    try {
      const { cliente_id, marca, modelo, anio, chasis, placa } = req.body;
      if (!cliente_id || !marca || !modelo) {
        return res.status(400).json({ error: 'Cliente, marca y modelo son obligatorios' });
      }
      const [result] = await pool.query(
        'INSERT INTO vehiculos (cliente_id, marca, modelo, anio, chasis, placa) VALUES (?, ?, ?, ?, ?, ?)',
        [cliente_id, marca, modelo, anio || null, chasis || null, placa || null]
      );
      res.status(201).json({ id: result.insertId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.put('/:id', async (req, res) => {
    try {
      const { cliente_id, marca, modelo, anio, chasis, placa } = req.body;
      await pool.query(
        'UPDATE vehiculos SET cliente_id = ?, marca = ?, modelo = ?, anio = ?, chasis = ?, placa = ? WHERE id = ?',
        [cliente_id, marca, modelo, anio || null, chasis || null, placa || null, req.params.id]
      );
      res.json({ mensaje: 'Vehículo actualizado' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // "Eliminar" = ocultar. El vehículo y sus órdenes siguen intactos para el Dashboard.
  router.delete('/:id', async (req, res) => {
    try {
      await pool.query('UPDATE vehiculos SET oculto = 1 WHERE id = ?', [req.params.id]);
      res.json({ mensaje: 'Vehículo eliminado' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};