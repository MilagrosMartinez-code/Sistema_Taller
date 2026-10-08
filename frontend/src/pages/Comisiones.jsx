import { useState } from 'react';
import axios from 'axios';
import { Printer } from 'lucide-react';
import Layout from '../components/Layout';
import { useToast } from '../hooks/useToast';

// Formato de guaraníes: Gs. 1.250.000 (separador de miles con punto, igual en todos los navegadores)
const formatearGs = (n) =>
  'Gs. ' + Math.round(Number(n) || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');

function Comisiones() {
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [datos, setDatos] = useState(null);
  const [porcentaje, setPorcentaje] = useState('');
  const [comisiones, setComisiones] = useState({});
  const { showToast } = useToast();

  const buscar = async () => {
    if (!desde || !hasta) {
      showToast('Elegí las dos fechas del rango', 'error');
      return;
    }
    try {
      const res = await axios.get('/api/ordenes/comisiones', { params: { desde, hasta } });
      setDatos(res.data);
      setComisiones({});
    } catch (error) {
      showToast(error.response?.data?.error || 'Error al cargar los datos', 'error');
    }
  };

  const tecnicos = {};
  (datos || []).forEach((fila) => {
    if (!tecnicos[fila.tecnico_id]) {
      tecnicos[fila.tecnico_id] = { nombre: fila.tecnico_nombre, servicios: [], subtotal: 0 };
    }
    tecnicos[fila.tecnico_id].servicios.push(fila);
    tecnicos[fila.tecnico_id].subtotal += Number(fila.total);
  });

  const aplicarPorcentajeATodos = () => {
    const pct = Number(porcentaje);
    if (!pct || pct <= 0) {
      showToast('Ingresá un porcentaje válido', 'error');
      return;
    }
    const nuevasComisiones = {};
    Object.keys(tecnicos).forEach((id) => {
      nuevasComisiones[id] = Math.round(tecnicos[id].subtotal * (pct / 100));
    });
    setComisiones(nuevasComisiones);
  };

  const totalComisiones = Object.values(comisiones).reduce((acc, v) => acc + v, 0);

  const formatearFecha = (f) => {
    if (!f) return '';
    const [anio, mes, dia] = f.split('-');
    return dia + '/' + mes + '/' + anio;
  };

  return (
    <Layout>
      <div className="dashboard-card no-print">
        <h3>Filtrar por período</h3>
        <div className="form-row">
          <input className="auth-input" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
          <input className="auth-input" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
          <button className="btn-primary" onClick={buscar}>Buscar</button>
        </div>
      </div>

      {datos && (
        <>
          <div className="solo-print reporte-encabezado">
            <h2>Extracto de Comisiones</h2>
            <p>Período: {formatearFecha(desde)} al {formatearFecha(hasta)}</p>
            <p>Impreso el {new Date().toLocaleDateString('es-PY')} a las {new Date().toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>

          <div className="dashboard-card no-print">
            <h3>Calculadora de comisión</h3>
            <div className="form-row">
              <input className="auth-input" type="number" placeholder="% de comisión (ej: 20)" value={porcentaje} onChange={(e) => setPorcentaje(e.target.value)} />
              <button className="btn-primary" onClick={aplicarPorcentajeATodos}>Aplicar a todos los técnicos</button>
            </div>
          </div>

          {Object.keys(tecnicos).length === 0 && (
            <div className="dashboard-card">
              <p style={{ color: '#8b8598' }}>No hay trabajos finalizados en ese período.</p>
            </div>
          )}

          {Object.keys(tecnicos).length > 0 && (
            <div className="no-print" style={{ textAlign: 'right', marginBottom: '16px' }}>
              <button className="btn-primary" onClick={() => window.print()} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Printer size={16} /> Imprimir extracto
              </button>
            </div>
          )}

          {Object.entries(tecnicos).map(([id, t]) => (
            <div key={id} className="dashboard-card tarjeta-comision">
              <h3>{t.nombre}</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Servicio</th>
                    <th>Cantidad</th>
                    <th>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {t.servicios.map((s) => (
                    <tr key={s.servicio}>
                      <td>{s.servicio}</td>
                      <td>{s.cantidad}</td>
                      <td>{formatearGs(s.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="comision-resumen">
                <div>Subtotal trabajado: <strong>{formatearGs(t.subtotal)}</strong></div>

                <div>
                  Comisión a pagar: <strong>{formatearGs(comisiones[id])}</strong>
                </div>
              </div>
            </div>
          ))}

          {Object.keys(tecnicos).length > 0 && (
            <div className="dashboard-card comision-total">
              <h3>Total a pagar en comisiones: {formatearGs(totalComisiones)}</h3>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}

export default Comisiones;