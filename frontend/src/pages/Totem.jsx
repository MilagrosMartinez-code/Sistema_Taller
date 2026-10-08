import { useState, useEffect } from 'react';
import axios from 'axios';
import { textoCola } from '../utils/estados';

const COLUMNAS = [
  { estado: 'En Cola', titulo: 'En Cola', clase: 'totem-col-cola' },
  { estado: 'En Proceso', titulo: 'En Proceso', clase: 'totem-col-proceso' },
  { estado: 'Finalizado', titulo: 'Listo para Retirar', clase: 'totem-col-listo' },
];

function Totem() {
  const [ordenes, setOrdenes] = useState([]);
  const [hora, setHora] = useState(new Date());

  const cargarOrdenes = async () => {
    const res = await axios.get('/api/ordenes/totem');
    setOrdenes(res.data);
  };

  useEffect(() => {
    cargarOrdenes();
    const intervaloDatos = setInterval(cargarOrdenes, 4000);
    const intervaloReloj = setInterval(() => setHora(new Date()), 1000);
    return () => {
      clearInterval(intervaloDatos);
      clearInterval(intervaloReloj);
    };
  }, []);

  return (
    <div className="totem-page">
      <div className="totem-header">
        <div className="totem-header-brand">
          <div className="auth-brand-badge">ST</div>
          <span>Sistema de Taller — Estado en Vivo</span>
        </div>
        <div className="totem-reloj">{hora.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' })}</div>
      </div>

      <div className="totem-grid">
        {COLUMNAS.map((col) => {
          const items = ordenes.filter((o) => o.estado_actual === col.estado);
          return (
            <div key={col.estado} className={'totem-columna ' + col.clase}>
              <h2>{col.titulo}</h2>
              {items.length === 0 && <p className="totem-vacio">Sin vehículos</p>}
              {items.map((o) => (
                <div key={o.codigo_unico} className="totem-item">
                  <div className="totem-item-codigo">{o.codigo_unico}</div>
                  <div className="totem-item-vehiculo">{o.marca} {o.modelo}</div>
                   <div className="totem-item-tecnico">Cliente: {o.cliente_nombre}</div>
                  {col.estado === 'En Cola' && (
                    <div className="totem-item-cola">{textoCola(o)}</div>
                  )}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Totem;