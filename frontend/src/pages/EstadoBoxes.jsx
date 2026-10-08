import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AnimatedServiceIcon from '../components/AnimatedServiceIcon';

function EstadoBoxes() {
  const [tecnicos, setTecnicos] = useState([]);
  const navigate = useNavigate();

  const cargar = async () => {
    try {
      const res = await axios.get('/api/ordenes/estado-tecnicos');
      setTecnicos(res.data);
    } catch (error) {
      // se reintenta solo en el próximo ciclo
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('cliente_token');
    if (!token) {
      navigate('/cliente/login');
      return;
    }
    cargar();
    const intervalo = setInterval(cargar, 5000);
    return () => clearInterval(intervalo);
  }, [navigate]);

  return (
    <div className="boxes-page">
      <div className="boxes-header">
        <Link to="/cliente/panel" className="boxes-volver">← Volver a mi panel</Link>
        <h1>Estado de los boxes en vivo</h1>
        <p>Mirá cómo está la sala antes de venir</p>
      </div>

      <div className="boxes-grid">
        {tecnicos.map((t) => (
          <div key={t.tecnico_id} className={'box-card' + (t.servicio_actual ? ' ocupado' : ' libre')}>
            <div className="box-card-header">
              <span className="box-card-nombre">{t.tecnico_nombre}</span>
              <span className={'box-card-estado' + (t.servicio_actual ? ' ocupado' : ' libre')}>
                {t.servicio_actual ? 'Ocupado' : 'Libre'}
              </span>
            </div>

            {t.servicio_actual ? (
              <div className="box-card-trabajo">
                <AnimatedServiceIcon servicio={t.servicio_actual} size={34} />
                <div>
                  <div className="box-card-servicio">{t.servicio_actual}</div>
                  <div className="box-card-vehiculo">{t.vehiculo_actual}</div>
                </div>
              </div>
            ) : (
              <div className="box-card-libre-msg">Sin trabajo en este momento</div>
            )}

            {Number(t.en_cola) > 0 && (
              <div className="box-card-cola">+ {t.en_cola} vehículo(s) en espera</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default EstadoBoxes;