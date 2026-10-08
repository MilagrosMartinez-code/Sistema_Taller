const express = require('express');
const router = express.Router();
const verificarToken = require('./authMiddleware');

function generarCodigo() {
  const fecha = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 900 + 100);
  return `ORD-${fecha}${random}`;
}

const PERMISOS_ESTADO = {
  tecnico: ['En Proceso', 'Finalizado', 'Entregado', 'Cancelado'],
  admin: ['En Cola', 'En Proceso', 'Finalizado', 'Entregado', 'Cancelado'],
};

const ESTADOS_VALIDOS = ['En Cola', 'En Proceso', 'Finalizado', 'Entregado', 'Cancelado'];

function mensajeProfesional(orden) {
  switch (orden.estado_actual) {
    case 'En Cola':
      return orden.posicion_cola <= 1
        ? 'Tu vehículo es el siguiente en ser atendido.'
        : `Tu vehículo está en espera. Hay ${orden.posicion_cola - 1} vehículo(s) por delante.`;
    case 'En Proceso':
      return 'Nuestro equipo está trabajando en tu vehículo en este momento.';
    case 'Finalizado':
      return `¡Tu vehículo está listo! Por favor, acercate a caja con tu número de orden ${orden.codigo_unico} para abonar.`;
    case 'Entregado':
      return 'Gracias por confiar en nosotros. Este servicio ya fue completado y entregado.';
    case 'Cancelado':
      return 'Esta orden fue cancelada.';
    default:
      return '';
  }
}

module.exports = (pool) => {

  router.get('/', verificarToken, async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT o.*, v.marca, v.modelo, v.placa, c.nombre AS cliente_nombre,
               t.nombre AS tecnico_nombre,
               (SELECT COUNT(*) FROM ordenes_trabajo o2
                WHERE o2.estado_actual = 'En Cola' AND o2.fecha_ingreso <= o.fecha_ingreso) AS posicion_cola
        FROM ordenes_trabajo o
        JOIN vehiculos v ON o.vehiculo_id = v.id
        JOIN clientes c ON v.cliente_id = c.id
        LEFT JOIN usuarios t ON o.tecnico_id = t.id
        WHERE o.oculto = 0 OR o.oculto IS NULL
        ORDER BY o.id DESC
      `);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/tecnicos-disponibilidad', verificarToken, async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT u.id, u.nombre,
          COALESCE(SUM(CASE WHEN o.estado_actual = 'En Cola' THEN 1 ELSE 0 END), 0) AS en_cola,
          COALESCE(SUM(CASE WHEN o.estado_actual = 'En Proceso' THEN 1 ELSE 0 END), 0) AS en_proceso,
          COUNT(o.id) AS total_activas
        FROM usuarios u
        LEFT JOIN ordenes_trabajo o ON o.tecnico_id = u.id AND o.estado_actual IN ('En Cola', 'En Proceso')
        WHERE u.rol = 'tecnico'
        GROUP BY u.id, u.nombre
        ORDER BY total_activas ASC, u.nombre ASC
      `);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Órdenes del cliente logueado, cada una con su historial completo de fecha/hora
  router.get('/mis-ordenes', verificarToken, async (req, res) => {
    try {
      if (req.usuario.rol !== 'cliente') {
        return res.status(403).json({ error: 'Solo disponible para clientes' });
      }
      const [ordenes] = await pool.query(`
        SELECT o.id, o.codigo_unico, o.estado_actual, o.servicio, o.costo, o.fecha_ingreso,
               v.marca, v.modelo,
               (SELECT COUNT(*) FROM ordenes_trabajo o2
                WHERE o2.estado_actual = 'En Cola' AND o2.fecha_ingreso <= o.fecha_ingreso) AS posicion_cola
        FROM ordenes_trabajo o
        JOIN vehiculos v ON o.vehiculo_id = v.id
        WHERE v.cliente_id = ?
        ORDER BY o.fecha_ingreso DESC
      `, [req.usuario.id]);

      if (ordenes.length === 0) {
        return res.json([]);
      }

      const ids = ordenes.map((o) => o.id);
      const [historial] = await pool.query(`
        SELECT h.orden_id, h.estado, h.fecha_cambio, u.nombre AS usuario_nombre
        FROM historial_estados h
        LEFT JOIN usuarios u ON h.usuario_id = u.id
        WHERE h.orden_id IN (?)
        ORDER BY h.fecha_cambio ASC
      `, [ids]);

      const ordenesConHistorial = ordenes.map((o) => ({
        ...o,
        historial: historial.filter((h) => h.orden_id === o.id)
      }));

      res.json(ordenesConHistorial);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Historial de una orden puntual (uso interno: admin/vendedor/técnico)
  router.get('/:id/historial', verificarToken, async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT h.estado, h.fecha_cambio, h.comentario, u.nombre AS usuario_nombre
        FROM historial_estados h
        LEFT JOIN usuarios u ON h.usuario_id = u.id
        WHERE h.orden_id = ?
        ORDER BY h.fecha_cambio ASC
      `, [req.params.id]);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.post('/', verificarToken, async (req, res) => {
    try {
      const { vehiculo_id, tecnico_id, servicio, costo, fecha_estim_entrega, descripcion } = req.body;
      if (!vehiculo_id || !servicio) {
        return res.status(400).json({ error: 'Vehículo y servicio son obligatorios' });
      }
      if (!costo || Number(costo) <= 0) {
        return res.status(400).json({ error: 'El costo debe ser mayor a cero' });
      }
      const codigo_unico = generarCodigo();

      const [result] = await pool.query(
        `INSERT INTO ordenes_trabajo (vehiculo_id, tecnico_id, codigo_unico, estado_actual, fecha_estim_entrega, descripcion, servicio, costo)
         VALUES (?, ?, ?, 'En Cola', ?, ?, ?, ?)`,
        [vehiculo_id, tecnico_id || null, codigo_unico, fecha_estim_entrega || null, descripcion || null, servicio, costo]
      );

      await pool.query(
        'INSERT INTO historial_estados (orden_id, usuario_id, estado, comentario) VALUES (?, ?, ?, ?)',
        [result.insertId, req.usuario.id, 'En Cola', 'Orden creada']
      );

      res.status(201).json({ id: result.insertId, codigo_unico });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.patch('/:id/estado', verificarToken, async (req, res) => {
    try {
      const { estado } = req.body;
      const { rol, id: usuario_id } = req.usuario;

      if (!ESTADOS_VALIDOS.includes(estado)) {
        return res.status(400).json({ error: 'Estado inválido' });
      }

      const permitidos = PERMISOS_ESTADO[rol] || [];
      if (!permitidos.includes(estado)) {
        return res.status(403).json({ error: `El rol "${rol}" no tiene permiso para establecer el estado "${estado}"` });
      }

      if (estado === 'En Proceso') {
        const [enCurso] = await pool.query(
          `SELECT id FROM ordenes_trabajo WHERE tecnico_id = ? AND estado_actual = 'En Proceso' AND id != ?`,
          [usuario_id, req.params.id]
        );
        if (enCurso.length > 0) {
          return res.status(400).json({ error: 'Ya tenés un trabajo en proceso. Finalizalo antes de iniciar otro.' });
        }
      }

      await pool.query('UPDATE ordenes_trabajo SET estado_actual = ? WHERE id = ?', [estado, req.params.id]);
      await pool.query(
        'INSERT INTO historial_estados (orden_id, usuario_id, estado) VALUES (?, ?, ?)',
        [req.params.id, usuario_id, estado]
      );

      res.json({ mensaje: 'Estado actualizado' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.delete('/:id', verificarToken, async (req, res) => {
    try {
      await pool.query('UPDATE ordenes_trabajo SET oculto = 1 WHERE id = ?', [req.params.id]);
      res.json({ mensaje: 'Orden quitada de la lista' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/publico/:codigo', async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT o.codigo_unico, o.estado_actual, o.fecha_ingreso, o.fecha_estim_entrega,
               o.servicio, o.costo,
               v.marca, v.modelo, v.placa, c.nombre AS cliente_nombre, c.password_hash,
               (SELECT COUNT(*) FROM ordenes_trabajo o2
                WHERE o2.estado_actual = 'En Cola' AND o2.fecha_ingreso <= o.fecha_ingreso) AS posicion_cola
        FROM ordenes_trabajo o
        JOIN vehiculos v ON o.vehiculo_id = v.id
        JOIN clientes c ON v.cliente_id = c.id
        WHERE o.codigo_unico = ?
      `, [req.params.codigo]);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Orden no encontrada' });
      }
      const orden = rows[0];
      const cliente_registrado = !!orden.password_hash;
      delete orden.password_hash;
      res.json({ ...orden, mensaje: mensajeProfesional(orden), cliente_registrado });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/totem', async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT o.codigo_unico, o.estado_actual, o.fecha_ingreso, v.marca, v.modelo,
               c.nombre AS cliente_nombre,
               (SELECT COUNT(*) FROM ordenes_trabajo o2
                WHERE o2.estado_actual = 'En Cola' AND o2.fecha_ingreso <= o.fecha_ingreso) AS posicion_cola
        FROM ordenes_trabajo o
        JOIN vehiculos v ON o.vehiculo_id = v.id
        JOIN clientes c ON v.cliente_id = c.id
        WHERE o.estado_actual IN ('En Cola', 'En Proceso', 'Finalizado')
        ORDER BY o.fecha_ingreso ASC
      `);

      const rowsConNombreCorto = rows.map((r) => {
        const partes = r.cliente_nombre.trim().split(' ');
        const nombreCorto = partes.length > 1
          ? partes[0] + ' ' + partes[partes.length - 1][0] + '.'
          : partes[0];
        return { ...r, cliente_nombre: nombreCorto };
      });

      res.json(rowsConNombreCorto);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/estado-tecnicos', async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT u.id AS tecnico_id, u.nombre AS tecnico_nombre,
          MAX(CASE WHEN o.estado_actual = 'En Proceso' THEN o.servicio END) AS servicio_actual,
          MAX(CASE WHEN o.estado_actual = 'En Proceso' THEN CONCAT(v.marca, ' ', v.modelo) END) AS vehiculo_actual,
          COALESCE(SUM(CASE WHEN o.estado_actual = 'En Cola' THEN 1 ELSE 0 END), 0) AS en_cola
        FROM usuarios u
        LEFT JOIN ordenes_trabajo o ON o.tecnico_id = u.id AND o.estado_actual IN ('En Cola', 'En Proceso')
        LEFT JOIN vehiculos v ON o.vehiculo_id = v.id
        WHERE u.rol = 'tecnico'
        GROUP BY u.id, u.nombre
        ORDER BY u.nombre
      `);
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/dashboard', verificarToken, async (req, res) => {
    try {
      const [[kpis]] = await pool.query(`
        SELECT
          COALESCE(SUM(CASE WHEN estado_actual IN ('Finalizado','Entregado') THEN costo ELSE 0 END), 0) AS ingresosTotales,
          COUNT(CASE WHEN estado_actual IN ('Finalizado','Entregado') THEN 1 END) AS ordenesCompletadas
        FROM ordenes_trabajo
      `);

      const [[tiempo]] = await pool.query(`
        SELECT AVG(TIMESTAMPDIFF(HOUR, o.fecha_ingreso, h.fecha_cambio)) AS horasPromedio
        FROM ordenes_trabajo o
        JOIN historial_estados h ON h.orden_id = o.id AND h.estado = 'Finalizado'
      `);

      const [ventasPorServicio] = await pool.query(`
        SELECT servicio, COALESCE(SUM(costo), 0) AS total
        FROM ordenes_trabajo
        WHERE estado_actual IN ('Finalizado', 'Entregado')
        GROUP BY servicio
        ORDER BY total DESC
      `);

      const [ordenesPorMarca] = await pool.query(`
        SELECT v.marca, COUNT(*) AS cantidad
        FROM ordenes_trabajo o
        JOIN vehiculos v ON o.vehiculo_id = v.id
        GROUP BY v.marca
        ORDER BY cantidad DESC
      `);

      const [ordenesPorEstado] = await pool.query(`
        SELECT estado_actual AS estado, COUNT(*) AS cantidad
        FROM ordenes_trabajo
        GROUP BY estado_actual
      `);

      const [trabajosPorTecnico] = await pool.query(`
        SELECT u.nombre AS tecnico, COUNT(*) AS cantidad
        FROM ordenes_trabajo o
        JOIN usuarios u ON o.tecnico_id = u.id
        WHERE o.estado_actual IN ('Finalizado', 'Entregado')
        GROUP BY u.nombre
        ORDER BY cantidad DESC
      `);

      const [[colaKpi]] = await pool.query(`
        SELECT AVG(TIMESTAMPDIFF(MINUTE, o.fecha_ingreso, h.fecha_cambio)) AS minutos
        FROM ordenes_trabajo o
        JOIN historial_estados h ON h.orden_id = o.id AND h.estado = 'En Proceso'
      `);

      const [[trabajoKpi]] = await pool.query(`
        SELECT AVG(TIMESTAMPDIFF(MINUTE, h1.fecha_cambio, h2.fecha_cambio)) AS minutos
        FROM historial_estados h1
        JOIN historial_estados h2 ON h1.orden_id = h2.orden_id
        WHERE h1.estado = 'En Proceso' AND h2.estado = 'Finalizado'
      `);

      // Cola + trabajo combinados por servicio, en UNA sola consulta (para el gráfico apilado)
      const [tiempoPorServicioDesglosado] = await pool.query(`
        SELECT o.servicio,
          AVG(TIMESTAMPDIFF(MINUTE, o.fecha_ingreso, h1.fecha_cambio)) AS minutosCola,
          AVG(TIMESTAMPDIFF(MINUTE, h1.fecha_cambio, h2.fecha_cambio)) AS minutosTrabajo
        FROM ordenes_trabajo o
        JOIN historial_estados h1 ON h1.orden_id = o.id AND h1.estado = 'En Proceso'
        JOIN historial_estados h2 ON h2.orden_id = o.id AND h2.estado = 'Finalizado'
        GROUP BY o.servicio
      `);

      // Tiempo promedio de trabajo, por técnico individual
      const [tiempoPorTecnico] = await pool.query(`
        SELECT u.nombre AS tecnico,
          AVG(TIMESTAMPDIFF(MINUTE, h1.fecha_cambio, h2.fecha_cambio)) AS minutos,
          COUNT(*) AS cantidad
        FROM ordenes_trabajo o
        JOIN usuarios u ON o.tecnico_id = u.id
        JOIN historial_estados h1 ON h1.orden_id = o.id AND h1.estado = 'En Proceso'
        JOIN historial_estados h2 ON h2.orden_id = o.id AND h2.estado = 'Finalizado'
        GROUP BY u.nombre
        ORDER BY minutos ASC
      `);

      const ingresosTotales = Number(kpis.ingresosTotales) || 0;
      const ordenesCompletadas = Number(kpis.ordenesCompletadas) || 0;

      res.json({
        ingresosTotales,
        ordenesCompletadas,
        ticketPromedio: ordenesCompletadas ? Math.round(ingresosTotales / ordenesCompletadas) : 0,
        tiempoPromedioHoras: tiempo.horasPromedio ? Math.round(tiempo.horasPromedio * 10) / 10 : 0,
        ventasPorServicio,
        ordenesPorMarca,
        ordenesPorEstado,
        trabajosPorTecnico,
        tiempoColaPromedioMinutos: colaKpi.minutos ? Math.round(colaKpi.minutos) : 0,
        tiempoTrabajoPromedioMinutos: trabajoKpi.minutos ? Math.round(trabajoKpi.minutos) : 0,
        tiempoPorServicioDesglosado,
        tiempoPorTecnico,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/comisiones', verificarToken, async (req, res) => {
    try {
      if (req.usuario.rol !== 'admin') {
        return res.status(403).json({ error: 'Solo el administrador puede ver esta información' });
      }
      const { desde, hasta } = req.query;
      if (!desde || !hasta) {
        return res.status(400).json({ error: 'Debés indicar un rango de fechas (desde y hasta)' });
      }

      const [rows] = await pool.query(`
        SELECT u.id AS tecnico_id, u.nombre AS tecnico_nombre, o.servicio,
               COUNT(DISTINCT o.id) AS cantidad, COALESCE(SUM(o.costo), 0) AS total
        FROM ordenes_trabajo o
        JOIN usuarios u ON o.tecnico_id = u.id
        JOIN historial_estados h ON h.orden_id = o.id AND h.estado = 'Finalizado'
        WHERE o.estado_actual IN ('Finalizado', 'Entregado')
          AND DATE(h.fecha_cambio) BETWEEN ? AND ?
        GROUP BY u.id, u.nombre, o.servicio
        ORDER BY u.nombre, o.servicio
      `, [desde, hasta]);

      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  router.delete('/:id/permanente', verificarToken, async (req, res) => {
    try {
      await pool.query('DELETE FROM historial_estados WHERE orden_id = ?', [req.params.id]);
      await pool.query('DELETE FROM ordenes_trabajo WHERE id = ?', [req.params.id]);
      res.json({ mensaje: 'Orden eliminada permanentemente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};