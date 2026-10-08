import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Trash2, KeyRound, X } from 'lucide-react';
import Layout from '../components/Layout';
import PasswordInput from '../components/PasswordInput';
import PasswordChecklist, { passwordEsValida } from '../components/PasswordChecklist';
import { useToast } from '../hooks/useToast';

function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [promocion, setPromocion] = useState({ activa: false, visitas_requeridas: 10, descripcion: '' });
  const [modalPassword, setModalPassword] = useState(null);
  const [nuevaPassword, setNuevaPassword] = useState('');
  const { showToast } = useToast();

  const cargarUsuarios = async () => {
    const res = await axios.get('/api/usuarios');
    setUsuarios(res.data);
  };

  const cargarPromocion = async () => {
    const res = await axios.get('/api/promocion');
    setPromocion(res.data);
  };

  useEffect(() => {
    cargarUsuarios();
    cargarPromocion();
  }, []);

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar este usuario?')) return;
    try {
      await axios.delete('/api/usuarios/' + id);
      showToast('Usuario eliminado', 'success');
      cargarUsuarios();
    } catch (error) {
      showToast(error.response?.data?.error || 'Error al eliminar', 'error');
    }
  };

  const handleGuardarPromocion = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/api/promocion', promocion);
      showToast('Promoción actualizada', 'success');
    } catch (error) {
      showToast(error.response?.data?.error || 'Error al guardar', 'error');
    }
  };

  const abrirResetPassword = (id) => {
    setModalPassword(id);
    setNuevaPassword('');
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!passwordEsValida(nuevaPassword)) {
      showToast('La contraseña debe cumplir los 3 requisitos', 'error');
      return;
    }
    try {
      await axios.patch('/api/usuarios/' + modalPassword + '/password', { password: nuevaPassword });
      showToast('Contraseña restablecida', 'success');
      setModalPassword(null);
    } catch (error) {
      showToast(error.response?.data?.error || 'Error al restablecer', 'error');
    }
  };

  return (
    <Layout>
      <div className="dashboard-card">
        <h3>Promoción de fidelidad</h3>
        <form onSubmit={handleGuardarPromocion}>
          <div className="form-row">
            <label className="promocion-toggle">
              <input
                type="checkbox"
                checked={!!promocion.activa}
                onChange={(e) => setPromocion({ ...promocion, activa: e.target.checked })}
              />
              Promoción activa
            </label>
            <input
              className="auth-input"
              type="number"
              min="1"
              placeholder="Visitas requeridas"
              value={promocion.visitas_requeridas}
              onChange={(e) => setPromocion({ ...promocion, visitas_requeridas: e.target.value })}
              style={{ maxWidth: '160px' }}
            />
            <input
              className="auth-input"
              placeholder="Descripción del premio (ej: 10% de descuento)"
              value={promocion.descripcion}
              onChange={(e) => setPromocion({ ...promocion, descripcion: e.target.value })}
            />
            <button className="btn-primary" type="submit">Guardar</button>
          </div>
        </form>
      </div>

      <div className="dashboard-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ marginBottom: 0 }}>Usuarios del sistema</h3>
          <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} /> Nuevo usuario
          </Link>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.nombre}</td>
                <td>{u.email}</td>
                <td style={{ textTransform: 'capitalize' }}>{u.rol}</td>
                <td>
                  <button className="btn-icon edit" onClick={() => abrirResetPassword(u.id)}>
                    <KeyRound size={14} /> Restablecer
                  </button>
                  <button className="btn-icon delete" onClick={() => handleEliminar(u.id)}>
                    <Trash2 size={14} /> Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalPassword && (
        <div className="modal-overlay" onClick={() => setModalPassword(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Restablecer contraseña</h3>
              <button className="modal-cerrar" onClick={() => setModalPassword(null)}><X size={18} /></button>
            </div>
            <form onSubmit={handleResetPassword}>
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

export default Usuarios;