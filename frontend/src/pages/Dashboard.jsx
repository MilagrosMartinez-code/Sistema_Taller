import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import Layout from '../components/Layout';

const COLORES = ['#7c3aed', '#a855f7', '#6366f1', '#c4b5fd', '#4c1d95', '#8b5cf6'];
const COLORES_ESTADO = { 'En Cola': '#a855f7', 'En Proceso': '#6366f1', 'Finalizado': '#22c55e', 'Entregado': '#94a3b8', 'Cancelado': '#ef4444' };
const RADIAN = Math.PI / 180;

function renderEtiquetaTorta(props) {
  const { cx, cy, midAngle, outerRadius, name, value } = props;
  const radio = outerRadius + 22;
  const x = cx + radio * Math.cos(-midAngle * RADIAN);
  const y = cy + radio * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#4a4458" fontSize={12} fontWeight={600} textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {name + ' (' + value + ')'}
    </text>
  );
}

function formatearMinutos(mins) {
  if (!mins) return '—';
  const horas = Math.floor(mins / 60);
  const minutos = Math.round(mins % 60);
  if (horas === 0) return minutos + ' min';
  return horas + 'h ' + minutos + 'min';
}

function NombreSerie(value) {
  return value === 'minutosCola' ? 'Tiempo en cola' : 'Tiempo de trabajo';
}

function Dashboard() {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/api/ordenes/dashboard')
      .then((res) => setDatos(res.data))
      .catch((err) => setError(err.message || 'Error al cargar el dashboard'));
  }, []);

  if (error) {
    return (
      <Layout>
        <p style={{ color: '#a32d2d' }}>No se pudo cargar el dashboard: {error}</p>
      </Layout>
    );
  }

  if (!datos) {
    return (
      <Layout>
        <p style={{ color: '#8b8598' }}>Cargando métricas...</p>
      </Layout>
    );
  }

  const tiempoServicioGrafico = datos.tiempoPorServicioDesglosado.map((s) => ({
    servicio: s.servicio,
    minutosCola: Math.round(s.minutosCola),
    minutosTrabajo: Math.round(s.minutosTrabajo)
  }));

  const tiempoTecnicoGrafico = datos.tiempoPorTecnico.map((t) => ({
    tecnico: t.tecnico,
    minutos: Math.round(t.minutos)
  }));

  return (
    <Layout>
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Ingresos totales</div>
          <div className="kpi-value">Gs. {datos.ingresosTotales.toLocaleString('es-PY')}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Órdenes completadas</div>
          <div className="kpi-value">{datos.ordenesCompletadas}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Ticket promedio</div>
          <div className="kpi-value">Gs. {datos.ticketPromedio.toLocaleString('es-PY')}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Tiempo total promedio (cola + trabajo)</div>
          <div className="kpi-value">{datos.tiempoPromedioHoras} hs</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Tiempo promedio de espera (cola)</div>
          <div className="kpi-value">{formatearMinutos(datos.tiempoColaPromedioMinutos)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Tiempo promedio de reparación</div>
          <div className="kpi-value">{formatearMinutos(datos.tiempoTrabajoPromedioMinutos)}</div>
        </div>
      </div>

      <div className="dashboard-card">
        <h3>Ventas por tipo de servicio</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={datos.ventasPorServicio}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ece5fa" />
            <XAxis dataKey="servicio" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => 'Gs. ' + Number(v).toLocaleString('es-PY')} />
            <Bar dataKey="total" fill="#7c3aed" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="dashboard-card">
        <h3>Tiempo de espera vs. tiempo de reparación, por servicio</h3>
        <p style={{ fontSize: '12px', color: '#8b8598', marginBottom: '12px', marginTop: '-8px' }}>
          Cada barra muestra el total del proceso: la parte lila es cuánto espera el cliente, la parte índigo es cuánto tarda el técnico trabajando.
        </p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={tiempoServicioGrafico} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#ece5fa" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey="servicio" type="category" width={160} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v, name) => [formatearMinutos(v), NombreSerie(name)]} />
            <Legend formatter={NombreSerie} />
            <Bar dataKey="minutosCola" stackId="tiempo" fill="#a855f7" name="minutosCola" />
            <Bar dataKey="minutosTrabajo" stackId="tiempo" fill="#6366f1" name="minutosTrabajo" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="dashboard-card">
        <h3>Tiempo promedio de reparación, por técnico</h3>
        <p style={{ fontSize: '12px', color: '#8b8598', marginBottom: '12px', marginTop: '-8px' }}>
          Cuánto tarda cada técnico, en promedio, desde que empieza hasta que finaliza un trabajo.
        </p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={tiempoTecnicoGrafico} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#ece5fa" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis dataKey="tecnico" type="category" width={120} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => formatearMinutos(v)} />
            <Bar dataKey="minutos" fill="#22c55e" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="dashboard-card">
        <h3>Órdenes por marca de vehículo</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={datos.ordenesPorMarca}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ece5fa" />
            <XAxis dataKey="marca" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="cantidad" fill="#a855f7" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="dashboard-card">
        <h3>Trabajos finalizados por técnico</h3>
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={datos.trabajosPorTecnico}
              dataKey="cantidad"
              nameKey="tecnico"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={renderEtiquetaTorta}
            >
              {datos.trabajosPorTecnico.map((entry, i) => (
                <Cell key={i} fill={COLORES[i % COLORES.length]} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="dashboard-card">
        <h3>Distribución de órdenes por estado</h3>
        <ResponsiveContainer width="100%" height={340}>
          <PieChart>
            <Pie
              data={datos.ordenesPorEstado}
              dataKey="cantidad"
              nameKey="estado"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={renderEtiquetaTorta}
            >
              {datos.ordenesPorEstado.map((entry, i) => (
                <Cell key={i} fill={COLORES_ESTADO[entry.estado] || COLORES[i % COLORES.length]} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Layout>
  );
}

export default Dashboard;