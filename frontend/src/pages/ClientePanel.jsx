import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { textoCola, BADGE_CLASE } from '../utils/estados';
import TarjetaFidelidad from '../components/TarjetaFidelidad';

function ClientePanel() {
  const [ordenes, setOrdenes] = useState(null);
  const [promocion, setPromocion] = useState({ activa: false, visitas_requeridas: 10, descripcion: '' });
  const [expandido, setExpandido] = useState({});
  const navigate = useNavigate();
  const cliente = JSON.parse(localStorage.getItem('cliente') || 'null');

  useEffect(() => {
    const token = localStorage.getItem('cliente_token');
    if (!token) {
      navigate('/cliente/login');
      return;
    }
    axios.get('/api/ordenes/mis-ordenes', { headers: { Authorization: 'Bearer ' + token } })
      .then((res) => setOrdenes(res.data))
      .catch(() => navigate('/cliente/login'));

    axios.get('/api/promocion').then((res) => setPromocion(res.data));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('cliente_token');
    localStorage.removeItem('cliente');
    navigate('/cliente/login');
  };

  const toggleExpandido = (codigo) => {
    setExpandido({ ...expandido, [codigo]: !expandido[codigo] });
  };

  const formatearFechaHora = (f) => {
    return new Date(f).toLocaleString('es-PY', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const visitas = ordenes ? ordenes.filter((o) => ['Finalizado', 'Entregado'].includes(o.estado_actual)).length : 0;

  return (
    <div className="cliente-panel-page">
      <div className="cliente-panel-header">
        <div className="auth-brand-badge">ST</div>
        <div>
          <div className="cliente-panel-nombre">Hola, {cliente?.nombre}</div>
          <div className="cliente-panel-sub">Tus vehículos en el taller</div>
        </div>
        <button className="btn-logout" style={{ marginLeft: 'auto', width: 'auto' }} onClick={handleLogout}>
          Cerrar sesión
        </button>
      </div>

      <div className="cliente-panel-content">
        <TarjetaFidelidad
          visitas={visitas}
          requeridas={promocion.visitas_requeridas}
          descripcion={promocion.descripcion}
          activa={promocion.activa}
        />

        <Link to="/cliente/boxes" className="boxes-boton-destacado">
          <Activity size={18} /> Ver estado de los boxes en vivo
        </Link>

        {!ordenes && <p style={{ color: '#8b8598' }}>Cargando...</p>}
        {ordenes && ordenes.length === 0 && <p style={{ color: '#8b8598' }}>Todavía no tenés órdenes registradas.</p>}

        {ordenes && ordenes.map((o) => (
          <div key={o.codigo_unico} className="dashboard-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <strong>{o.codigo_unico}</strong>
              <span className={'badge-estado ' + BADGE_CLASE[o.estado_actual]}>
                {o.estado_actual === 'En Cola' ? textoCola(o) : o.estado_actual}
              </span>
            </div>
            <div style={{ fontSize: '13px', color: '#4a4458', marginBottom: '10px' }}>{o.marca} {o.modelo} · {o.servicio}</div>

            <button className="historial-toggle" onClick={() => toggleExpandido(o.codigo_unico)}>
              {expandido[o.codigo_unico] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {expandido[o.codigo_unico] ? 'Ocultar historial' : 'Ver historial de fechas'}
            </button>

            {expandido[o.codigo_unico] && (
              <div className="historial-timeline">
                {o.historial.map((h, i) => (
                  <div key={i} className="historial-item">
                    <div className="historial-punto" />
                    <div>
                      <div className="historial-estado">{h.estado}</div>
                      <div className="historial-fecha">{formatearFechaHora(h.fecha_cambio)}{h.usuario_nombre ? ' · ' + h.usuario_nombre : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ClientePanel;