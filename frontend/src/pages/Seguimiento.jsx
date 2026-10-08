import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Clock, Wrench, CheckCircle2, PackageCheck, XCircle } from 'lucide-react';

const PASOS = [
  { estado: 'En Cola', label: 'En Cola', icono: Clock },
  { estado: 'En Proceso', label: 'En Proceso', icono: Wrench },
  { estado: 'Finalizado', label: 'Finalizado', icono: CheckCircle2 },
  { estado: 'Entregado', label: 'Entregado', icono: PackageCheck },
];

function Seguimiento() {
  const { codigo } = useParams();
  const [orden, setOrden] = useState(null);
  const [error, setError] = useState('');

  const cargarOrden = async () => {
    try {
      const res = await axios.get('/api/ordenes/publico/' + codigo);
      setOrden(res.data);
      setError('');
    } catch (err) {
      setError('No encontramos ninguna orden con este código.');
    }
  };

  useEffect(() => {
    cargarOrden();
    const intervalo = setInterval(cargarOrden, 5000);
    return () => clearInterval(intervalo);
  }, [codigo]);

  if (error) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="auth-brand-badge" style={{ margin: '0 auto 14px' }}>!</div>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!orden) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <p style={{ color: '#8b8598' }}>Cargando...</p>
        </div>
      </div>
    );
  }

  const indiceActual = PASOS.findIndex((p) => p.estado === orden.estado_actual);

  return (
    <div className="auth-page">
      <div className="auth-card seguimiento-card">
        <div className="auth-brand">
          <div className="auth-brand-badge">ST</div>
          <h1>Hola, {orden.cliente_nombre}</h1>
          <p>Este es el estado de tu vehículo en tiempo real</p>
        </div>

        <div className="seguimiento-codigo">{orden.codigo_unico}</div>

        <div className="seguimiento-detalle">
          <div><strong>Vehículo:</strong> {orden.marca} {orden.modelo}{orden.placa ? ' — ' + orden.placa : ''}</div>
          <div><strong>Servicio:</strong> {orden.servicio}</div>
        </div>

        {orden.estado_actual === 'Cancelado' ? (
          <div className="seguimiento-cancelado">
            <XCircle size={36} />
            <p>Esta orden fue cancelada</p>
          </div>
        ) : (
          <div className="stepper">
            {PASOS.map((paso, i) => {
              const Icono = paso.icono;
              let clase = 'stepper-pendiente';
              if (i < indiceActual) clase = 'stepper-completado';
              if (i === indiceActual) clase = 'stepper-actual';
              return (
                <div key={paso.estado} className={'stepper-paso ' + clase}>
                  {i < PASOS.length - 1 && (
                    <div className={'stepper-linea' + (i < indiceActual ? ' activo' : '')} />
                  )}
                  <div className="stepper-circulo"><Icono size={18} /></div>
                  <span className="stepper-label">{paso.label}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className={'seguimiento-mensaje seguimiento-' + orden.estado_actual.replace(/\s/g, '')}>
          {orden.mensaje}
        </div>

        {['Finalizado', 'Entregado'].includes(orden.estado_actual) && orden.costo && (
          <div className="seguimiento-costo">Total: Gs. {Number(orden.costo).toLocaleString('es-PY')}</div>
        )}

        <p className="seguimiento-actualiza">Esta página se actualiza sola automáticamente</p>

        {!orden.cliente_registrado && (
          <div className="promo-cuenta">
            <p>¿Querés vivir una mejor experiencia y aprovechar descuentos y promociones por registrarte?</p>
            <Link to={'/cliente/registro?codigo=' + codigo} className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
              Crear Cuenta
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Seguimiento;