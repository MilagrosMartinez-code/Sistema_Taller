import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Pencil, Trash2, Search, Plus, Send, X, KeyRound } from 'lucide-react';
import Layout from '../components/Layout';
import Paginacion from '../components/Paginacion';
import TarjetaFidelidad from '../components/TarjetaFidelidad';
import PasswordInput from '../components/PasswordInput';
import PasswordChecklist, { passwordEsValida } from '../components/PasswordChecklist';
import MARCAS_MODELOS from '../data/marcasModelos';
import { useToast } from '../hooks/useToast';

const MARCAS = Object.keys(MARCAS_MODELOS);
const POR_PAGINA = 5;

function ClientesVehiculos() {
  const [clientes, setClientes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [promocion, setPromocion] = useState({ activa: false, visitas_requeridas: 10, descripcion: '' });
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);

  const [modalCliente, setModalCliente] = useState(null);
  const [modalVehiculo, setModalVehiculo] = useState(null);
  const [modalPasswordCliente, setModalPasswordCliente] = useState(null);
  const [nuevaPassword, setNuevaPassword] = useState('');

  const cargarDatos = async () => {
    const [resClientes, resVehiculos, resPromocion] = await Promise.all([
      axios.get('/api/clientes'),
      axios.get('/api/vehiculos'),
      axios.get('/api/promocion')
    ]);
    setClientes(resClientes.data);
    setVehiculos(resVehiculos.data);
    setPromocion(resPromocion.data);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const vehiculosDe = (clienteId) => vehiculos.filter((v) => v.cliente_id === clienteId);

  const textoBusqueda = busqueda.toLowerCase();
  const clientesFiltrados = clientes.filter((c) => {
    const matchCliente =
      c.nombre.toLowerCase().includes(textoBusqueda) ||
      (c.telefono || '').includes(busqueda) ||
      (c.email || '').toLowerCase().includes(textoBusqueda);
    const matchVehiculo = vehiculosDe(c.id).some(
      (v) => v.marca.toLowerCase().includes(textoBusqueda) || v.modelo.toLowerCase().includes(textoBusqueda)
    );
    return matchCliente || matchVehiculo;
  });

  const totalPaginas = Math.max(1, Math.ceil(clientesFiltrados.length / POR_PAGINA));
  const clientesPagina = clientesFiltrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const handleBuscar = (e) => {
    setBusqueda(e.target.value);
    setPagina(1);
  };

  const handleSubmitCliente = async (e) => {
    e.preventDefault();
    try {
      if (modalCliente.id) {
        await axios.put('/api/clientes/' + modalCliente.id, modalCliente);
        showToast('Cliente actualizado', 'success');
      } else {
        await axios.post('/api/clientes', modalCliente);
        showToast('Cliente agregado', 'success');
      }
      setModalCliente(null);
      cargarDatos();
    } catch (error) {
      showToast(error.response?.data?.error || 'Error al guardar el cliente', 'error');
    }
  };

  const handleEliminarCliente = async (id) => {
    if (!confirm('¿Eliminar este cliente?')) return;
    try {
      await axios.delete('/api/clientes/' + id);
      showToast('Cliente eliminado', 'success');
      cargarDatos();
    } catch (error) {
      showToast(error.response?.data?.error || 'Error al eliminar', 'error');
    }
  };

  const modelosDisponibles = MARCAS_MODELOS[modalVehiculo?.marca] || [];

  const handleSubmitVehiculo = async (e) => {
    e.preventDefault();
    try {
      if (modalVehiculo.id) {
        await axios.put('/api/vehiculos/' + modalVehiculo.id, modalVehiculo);
        showToast('Vehículo actualizado', 'success');
      } else {
        await axios.post('/api/vehiculos', modalVehiculo);
        showToast('Vehículo agregado', 'success');
      }
      setModalVehiculo(null);
      cargarDatos();
    } catch (error) {
      showToast(error.response?.data?.error || 'Error al guardar el vehículo', 'error');
    }
  };

  const handleEliminarVehiculo = async (id) => {
    if (!confirm('¿Eliminar este vehículo?')) return;
    try {
      await axios.delete('/api/vehiculos/' + id);
      showToast('Vehículo eliminado', 'success');
      cargarDatos();
    } catch (error) {
      showToast(error.response?.data?.error || 'Error al eliminar', 'error');
    }
  };

  const handleResetPasswordCliente = async (e) => {
    e.preventDefault();
    if (!passwordEsValida(nuevaPassword)) {
      showToast('La contraseña debe cumplir los 3 requisitos', 'error');
      return;
    }
    try {
      await axios.patch('/api/clientes/' + modalPasswordCliente + '/password', { password: nuevaPassword });
      showToast('Contraseña del cliente restablecida', 'success');
      setModalPasswordCliente(null);
    } catch (error) {
      showToast(error.response?.data?.error || 'Error al restablecer', 'error');
    }
  };

  const generarPedido = (cliente, vehiculo) => {
    navigate('/ordenes', {
      state: {
        vehiculoId: vehiculo.id,
        vehiculoTexto: cliente.nombre + ' — ' + vehiculo.marca + ' ' + vehiculo.modelo
      }
    });
  };

  return (
    <Layout>
      <div className="dashboard-card">
        <div className="clientes-toolbar">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              className="auth-input search-input"
              placeholder="Buscar por nombre, teléfono, marca o modelo..."
              value={busqueda}
              onChange={handleBuscar}
            />
          </div>
          <button className="btn-primary" onClick={() => setModalCliente({ nombre: '', telefono: '', email: '' })}>
            <Plus size={16} /> Nuevo cliente
          </button>
        </div>
      </div>

      <div className="dashboard-card">
        <h3>Clientes y sus vehículos ({clientesFiltrados.length})</h3>

        {clientesPagina.map((c) => (
          <div key={c.id} className="cliente-card">
            <div className="cliente-card-header">
              <div>
                <div className="cliente-card-nombre">{c.nombre}</div>
                <div className="cliente-card-datos">{c.telefono || '—'} · {c.email || '—'}</div>
              </div>
              <div>
                <button className="btn-icon edit" onClick={() => { setModalPasswordCliente(c.id); setNuevaPassword(''); }}>
                  <KeyRound size={14} /> Contraseña
                </button>
                <button className="btn-icon edit" onClick={() => setModalCliente({ id: c.id, nombre: c.nombre, telefono: c.telefono || '', email: c.email || '' })}>
                  <Pencil size={14} /> Editar
                </button>
                <button className="btn-icon delete" onClick={() => handleEliminarCliente(c.id)}>
                  <Trash2 size={14} /> Eliminar
                </button>
              </div>
            </div>

            <TarjetaFidelidad
              visitas={c.visitas || 0}
              requeridas={promocion.visitas_requeridas}
              descripcion={promocion.descripcion}
              activa={promocion.activa}
              compacta
            />

            <div className="vehiculos-anidados">
              {vehiculosDe(c.id).map((v) => (
                <div key={v.id} className="vehiculo-mini">
                  <div className="vehiculo-mini-info">
                    <strong>{v.marca} {v.modelo}</strong>{v.anio ? ' · ' + v.anio : ''}
                  </div>
                  <div className="vehiculo-mini-acciones">
                    <button className="btn-generar-pedido" onClick={() => generarPedido(c, v)}>
                      <Send size={13} /> Generar pedido
                    </button>
                    <button className="btn-icon edit" onClick={() => setModalVehiculo({ id: v.id, cliente_id: v.cliente_id, marca: v.marca, modelo: v.modelo, anio: v.anio || '' })}>
                      <Pencil size={13} />
                    </button>
                    <button className="btn-icon delete" onClick={() => handleEliminarVehiculo(v.id)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
              <button
                className="btn-agregar-vehiculo"
                onClick={() => setModalVehiculo({ cliente_id: c.id, marca: '', modelo: '', anio: '' })}
              >
                <Plus size={13} /> Agregar vehículo
              </button>
            </div>
          </div>
        ))}

        <Paginacion paginaActual={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
      </div>

      {modalCliente && (
        <div className="modal-overlay" onClick={() => setModalCliente(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalCliente.id ? 'Editar cliente' : 'Nuevo cliente'}</h3>
              <button className="modal-cerrar" onClick={() => setModalCliente(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmitCliente}>
              <div className="auth-field">
                <label>Nombre</label>
                <input className="auth-input" value={modalCliente.nombre} onChange={(e) => setModalCliente({ ...modalCliente, nombre: e.target.value })} required />
              </div>
              <div className="auth-field">
                <label>Teléfono</label>
                <input className="auth-input" value={modalCliente.telefono} onChange={(e) => setModalCliente({ ...modalCliente, telefono: e.target.value })} />
              </div>
              <div className="auth-field">
                <label>Email</label>
                <input className="auth-input" value={modalCliente.email} onChange={(e) => setModalCliente({ ...modalCliente, email: e.target.value })} />
              </div>
              <button className="btn-primary" type="submit" style={{ width: '100%' }}>
                {modalCliente.id ? 'Guardar cambios' : 'Agregar cliente'}
              </button>
            </form>
          </div>
        </div>
      )}

      {modalVehiculo && (
        <div className="modal-overlay" onClick={() => setModalVehiculo(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalVehiculo.id ? 'Editar vehículo' : 'Nuevo vehículo'}</h3>
              <button className="modal-cerrar" onClick={() => setModalVehiculo(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmitVehiculo}>
              <div className="auth-field">
                <label>Marca</label>
                <input
                  className="auth-input"
                  list="lista-marcas-modal"
                  value={modalVehiculo.marca}
                  onChange={(e) => setModalVehiculo({ ...modalVehiculo, marca: e.target.value })}
                  required
                />
                <datalist id="lista-marcas-modal">
                  {MARCAS.map((m) => <option key={m} value={m} />)}
                </datalist>
              </div>
              <div className="auth-field">
                <label>Modelo</label>
                <input
                  className="auth-input"
                  list="lista-modelos-modal"
                  value={modalVehiculo.modelo}
                  onChange={(e) => setModalVehiculo({ ...modalVehiculo, modelo: e.target.value })}
                  required
                />
                <datalist id="lista-modelos-modal">
                  {modelosDisponibles.map((m) => <option key={m} value={m} />)}
                  <option value="Otro" />
                </datalist>
              </div>
              <div className="auth-field">
                <label>Año</label>
                <input className="auth-input" value={modalVehiculo.anio} onChange={(e) => setModalVehiculo({ ...modalVehiculo, anio: e.target.value })} />
              </div>
              <button className="btn-primary" type="submit" style={{ width: '100%' }}>
                {modalVehiculo.id ? 'Guardar cambios' : 'Agregar vehículo'}
              </button>
            </form>
          </div>
        </div>
      )}

      {modalPasswordCliente && (
        <div className="modal-overlay" onClick={() => setModalPasswordCliente(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Restablecer contraseña del cliente</h3>
              <button className="modal-cerrar" onClick={() => setModalPasswordCliente(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleResetPasswordCliente}>
              <div className="auth-field">
                <label>Nueva contraseña</label>
                <PasswordInput value={nuevaPassword} onChange={(e) => setNuevaPassword(e.target.value)} required />
                <PasswordChecklist password={nuevaPassword} />
              </div>
              <button className="btn-primary" type="submit" style={{ width: '100%' }}>Guardar nueva contraseña</button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default ClientesVehiculos;