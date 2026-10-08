import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { QrCode, Trash2, History, Search } from 'lucide-react';
import Layout from '../components/Layout';
import Paginacion from '../components/Paginacion';
import QRCodigo from '../components/QRCodigo';
import { textoCola, BADGE_CLASE } from '../utils/estados';
import { useToast } from '../hooks/useToast';

const SERVICIOS = ['Polarizado', 'Multimedia & Audio', 'Llantas & Neumáticos', 'Alarmas & Seguridad Vehicular', 'Detailing & Lavado', 'Otro'];

const PRECIOS_SERVICIO = {
  'Polarizado': 250000,
  'Multimedia & Audio': 300000,
  'Llantas & Neumáticos': 200000,
  'Alarmas & Seguridad Vehicular': 200000,
  'Detailing & Lavado': 200000,
};

const POR_PAGINA = 8;

function Ordenes() {
  const location = useLocation();
  const [ordenes, setOrdenes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [form, setForm] = useState({ vehiculo_id: '', tecnico_id: '', servicio: '', costo: '' });
  const [vehiculoTexto, setVehiculoTexto] = useState('');
  const [ordenQR, setOrdenQR] = useState(null);
  const [historialOrden, setHistorialOrden] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
  const { showToast } = useToast();

  const cargarDatos = async () => {
    const [resOrdenes, resVehiculos, resTecnicos] = await Promise.all([
      axios.get('/api/ordenes'),
      axios.get('/api/vehiculos'),
      axios.get('/api/ordenes/tecnicos-disponibilidad')
    ]);
    setOrdenes(resOrdenes.data);
    setVehiculos(resVehiculos.data);
    setTecnicos(resTecnicos.data);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (location.state?.vehiculoId) {
      setForm((f) => ({ ...f, vehiculo_id: location.state.vehiculoId }));
      setVehiculoTexto(location.state.vehiculoTexto || '');
    }
  }, [location.state]);

  const opcionesVehiculo = vehiculos.map((v) => ({
    id: v.id,
    texto: v.cliente_nombre + ' — ' + v.marca + ' ' + v.modelo
  }));

  const handleVehiculoTexto = (e) => {
    const texto = e.target.value;
    setVehiculoTexto(texto);
    const encontrado = opcionesVehiculo.find((o) => o.texto === texto);
    setForm({ ...form, vehiculo_id: encontrado ? encontrado.id : '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'servicio') {
      setForm({
        ...form,
        servicio: value,
        costo: PRECIOS_SERVICIO[value] !== undefined ? PRECIOS_SERVICIO[value] : form.costo
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.vehiculo_id) {
      showToast('Elegí un vehículo válido de la lista de sugerencias', 'error');
      return;
    }
    if (!form.tecnico_id) {
      showToast('Tenés que asignar un técnico para crear la orden', 'error');
      return;
    }
    if (!form.costo || Number(form.costo) <= 0) {
      showToast('El costo debe ser mayor a cero', 'error');
      return;
    }
    try {
      await axios.post('/api/ordenes', {
        vehiculo_id: form.vehiculo_id,
        tecnico_id: form.tecnico_id,
        servicio: form.servicio,
        costo: form.costo,
        creado_por: usuario?.id
      });
      showToast('Orden creada correctamente', 'success');
      setForm({ vehiculo_id: '', tecnico_id: '', servicio: '', costo: '' });
      setVehiculoTexto('');
      cargarDatos();
    } catch (error) {
      showToast(error.response?.data?.error || 'Error al crear la orden', 'error');
    }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Quitar esta orden de tu lista? Los datos se conservan igual para el Dashboard.')) return;
    try {
      await axios.delete('/api/ordenes/' + id);
      showToast('Orden quitada de tu lista', 'success');
      cargarDatos();
    } catch (error) {
      showToast(error.response?.data?.error || 'Error al quitar la orden', 'error');
    }
  };

  const verHistorial = async (o) => {
    try {
      const res = await axios.get('/api/ordenes/' + o.id + '/historial');
      setHistorialOrden({ codigo: o.codigo_unico, eventos: res.data });
    } catch (error) {
      showToast('Error al cargar el historial', 'error');
    }
  };

  const formatearFechaHora = (f) => {
    return new Date(f).toLocaleString('es-PY', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const linkSeguimiento = (codigo) => window.location.origin + '/seguimiento/' + codigo;

  const handleBuscar = (e) => {
    setBusqueda(e.target.value);
    setPagina(1);
  };

  const textoBusqueda = busqueda.toLowerCase();
    const ordenesFiltradas = ordenes.filter((o) =>
    (o.cliente_nombre || '').toLowerCase().includes(textoBusqueda) ||
    (o.codigo_unico || '').toLowerCase().includes(textoBusqueda) ||
    (o.servicio || '').toLowerCase().includes(textoBusqueda)
  );

  const totalPaginas = Math.max(1, Math.ceil(ordenesFiltradas.length / POR_PAGINA));
  const ordenesPagina = ordenesFiltradas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  return (
    <Layout>
      <div className="dashboard-card">
        <h3>Nueva orden de trabajo</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              className="auth-input"
              list="lista-vehiculos-orden"
              placeholder="Buscar cliente o vehículo..."
              value={vehiculoTexto}
              onChange={handleVehiculoTexto}
              required
            />
            <datalist id="lista-vehiculos-orden">
              {opcionesVehiculo.map((o) => <option key={o.id} value={o.texto} />)}
            </datalist>

            <select className="auth-input" name="tecnico_id" value={form.tecnico_id} onChange={handleChange} required>
              <option value="">Asignar técnico</option>
              {tecnicos.map((t, i) => (
                <option key={t.id} value={t.id}>
                  {t.nombre} — {Number(t.en_proceso) > 0 ? 'Trabajando' : 'Libre'} ({t.en_cola} en cola){i === 0 ? ' · Sugerido' : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row" style={{ marginTop: '10px' }}>
            <select className="auth-input" name="servicio" value={form.servicio} onChange={handleChange} required>
              <option value="">Servicio</option>
              {SERVICIOS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <input className="auth-input" name="costo" placeholder="Costo (Gs.)" type="number" min="1" value={form.costo} onChange={handleChange} required />
            <button className="btn-primary" type="submit">Crear orden</button>
          </div>
        </form>
      </div>

      <div className="dashboard-card">
        <div className="search-box" style={{ marginBottom: '16px' }}>
          <Search size={16} className="search-icon" />
          <input
            className="auth-input search-input"
            placeholder="Buscar por nombre de cliente, N° de orden o servicio..."
            value={busqueda}
            onChange={handleBuscar}
          />
        </div>

        <h3>Órdenes de trabajo ({ordenesFiltradas.length})</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Cliente</th>
              <th>Vehículo</th>
              <th>Servicio</th>
              <th>Técnico asignado</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {ordenesPagina.map((o) => (
              <tr key={o.id}>
                <td>{o.codigo_unico}</td>
                <td>{o.cliente_nombre}</td>
                <td>{o.marca} {o.modelo}</td>
                <td>{o.servicio}</td>
                <td>{o.tecnico_nombre || '—'}</td>
                <td>
                  <span className={'badge-estado ' + BADGE_CLASE[o.estado_actual]}>
                    {o.estado_actual === 'En Cola' ? textoCola(o) : o.estado_actual}
                  </span>
                </td>
                <td>
                  <button className="btn-icon edit" onClick={() => verHistorial(o)}>
                    <History size={14} /> Historial
                  </button>
                  <button className="btn-icon edit" onClick={() => setOrdenQR(o)}>
                    <QrCode size={14} /> Ver QR
                  </button>
                  <button className="btn-icon delete" onClick={() => handleEliminar(o.id)}>
                    <Trash2 size={14} /> Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Paginacion paginaActual={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
      </div>

      {ordenQR && (
        <div className="qr-modal-overlay" onClick={() => setOrdenQR(null)}>
          <div className="qr-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>{ordenQR.codigo_unico}</h3>
            <p style={{ color: '#8b8598', fontSize: '13px', marginBottom: '16px' }}>
              El cliente escanea este código para ver el estado de su vehículo
            </p>
            <QRCodigo valor={linkSeguimiento(ordenQR.codigo_unico)} />
            <p style={{ fontSize: '12px', color: '#8b8598', marginTop: '14px', wordBreak: 'break-all' }}>
              {linkSeguimiento(ordenQR.codigo_unico)}
            </p>
            <button className="btn-primary" style={{ marginTop: '16px' }} onClick={() => setOrdenQR(null)}>Cerrar</button>
          </div>
        </div>
      )}

      {historialOrden && (
        <div className="qr-modal-overlay" onClick={() => setHistorialOrden(null)}>
          <div className="qr-modal-card" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'left', maxWidth: '360px' }}>
            <h3 style={{ marginBottom: '14px' }}>Historial — {historialOrden.codigo}</h3>
            <div className="historial-timeline">
              {historialOrden.eventos.map((h, i) => (
                <div key={i} className="historial-item">
                  <div className="historial-punto" />
                  <div>
                    <div className="historial-estado">{h.estado}</div>
                    <div className="historial-fecha">{formatearFechaHora(h.fecha_cambio)}{h.usuario_nombre ? ' · ' + h.usuario_nombre : ''}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-primary" style={{ marginTop: '16px', width: '100%' }} onClick={() => setHistorialOrden(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Ordenes;