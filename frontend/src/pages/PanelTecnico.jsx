import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { textoCola } from '../utils/estados';
import { useToast } from '../hooks/useToast';

const SIGUIENTE_ESTADO = {
  'En Cola': 'En Proceso',
  'En Proceso': 'Finalizado',
  'Finalizado': 'Entregado',
};

const BOTON_LABEL = {
  'En Cola': 'Iniciar proceso',
  'En Proceso': 'Finalizar trabajo',
  'Finalizado': 'Marcar Entregado',
};

const MENSAJE_EXITO = {
  'En Proceso': 'Trabajo iniciado',
  'Finalizado': '¡Trabajo finalizado! El cliente ya puede pasar a pagar en caja.',
  'Entregado': 'Vehículo entregado. ¡Buen trabajo!',
  'Cancelado': 'Orden cancelada',
};

function PanelTecnico() {
  const [ordenes, setOrdenes] = useState([]);
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
  const { showToast } = useToast();

  const cargarOrdenes = async () => {
    const res = await axios.get('/api/ordenes');
    const misOrdenes = res.data.filter(
      (o) => o.tecnico_id === usuario?.id && !['Entregado', 'Cancelado'].includes(o.estado_actual)
    );
    setOrdenes(misOrdenes);
  };

  useEffect(() => {
    cargarOrdenes();
  }, []);

  const tieneUnoEnProceso = ordenes.some((o) => o.estado_actual === 'En Proceso');

  const cambiarEstado = async (orden, estado) => {
    try {
      await axios.patch('/api/ordenes/' + orden.id + '/estado', {
        estado,
        usuario_id: usuario?.id,
        rol: usuario?.rol
      });
      showToast(MENSAJE_EXITO[estado] || 'Estado actualizado', estado === 'Cancelado' ? 'info' : 'success');
      cargarOrdenes();
    } catch (error) {
      showToast(error.response?.data?.error || 'No se pudo actualizar el estado', 'error');
    }
  };

  return (
    <Layout>
      <div className="dashboard-card">
        <h3>Mis trabajos asignados</h3>

        {ordenes.length === 0 && (
          <p style={{ color: '#8b8598', fontSize: '14px' }}>No tenés trabajos pendientes por ahora.</p>
        )}

        <div className="tecnico-grid">
          {ordenes.map((o) => {
            const bloqueado = o.estado_actual === 'En Cola' && tieneUnoEnProceso;
            return (
              <div key={o.id} className="tecnico-card">
                <div className="tecnico-card-codigo">{o.codigo_unico}</div>
                <div className="tecnico-card-vehiculo">{o.marca} {o.modelo}</div>
                <div className="tecnico-card-cliente">{o.cliente_nombre} · {o.servicio}</div>
                <div className="tecnico-card-estado">
                  {o.estado_actual === 'En Cola' ? textoCola(o) : o.estado_actual}
                </div>

                <button
                  className="btn-tecnico"
                  disabled={bloqueado}
                  onClick={() => cambiarEstado(o, SIGUIENTE_ESTADO[o.estado_actual])}
                >
                  {bloqueado ? 'Finalizá tu trabajo actual primero' : BOTON_LABEL[o.estado_actual]}
                </button>

                {!['Finalizado'].includes(o.estado_actual) && (
                  <button className="btn-tecnico-cancelar" onClick={() => cambiarEstado(o, 'Cancelado')}>
                    Cancelar orden
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}

export default PanelTecnico;