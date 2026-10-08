import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({ nombre: '', telefono: '', email: '' });
  const [editandoId, setEditandoId] = useState(null);

  const cargarClientes = async () => {
    const res = await axios.get('http://localhost:5000/api/clientes');
    setClientes(res.data);
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editandoId) {
      await axios.put(`http://localhost:5000/api/clientes/${editandoId}`, form);
    } else {
      await axios.post('http://localhost:5000/api/clientes', form);
    }
    setForm({ nombre: '', telefono: '', email: '' });
    setEditandoId(null);
    cargarClientes();
  };

  const handleEditar = (cliente) => {
    setForm({ nombre: cliente.nombre, telefono: cliente.telefono || '', email: cliente.email || '' });
    setEditandoId(cliente.id);
  };

  const handleEliminar = async (id) => {
    if (confirm('¿Eliminar este cliente?')) {
      await axios.delete(`http://localhost:5000/api/clientes/${id}`);
      cargarClientes();
    }
  };

  return (
    <Layout>
      <div className="dashboard-card">
        <h3>{editandoId ? 'Editar cliente' : 'Nuevo cliente'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <input className="auth-input" name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} required />
            <input className="auth-input" name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} />
            <input className="auth-input" name="email" placeholder="Email" value={form.email} onChange={handleChange} />
            <button className="btn-primary" type="submit">{editandoId ? 'Guardar' : 'Agregar'}</button>
          </div>
        </form>
      </div>

      <div className="dashboard-card">
        <h3>Clientes registrados</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => (
              <tr key={c.id}>
                <td>{c.nombre}</td>
                <td>{c.telefono || '—'}</td>
                <td>{c.email || '—'}</td>
                <td>
                  <button className="btn-icon edit" onClick={() => handleEditar(c)}>Editar</button>
                  <button className="btn-icon delete" onClick={() => handleEliminar(c.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

export default Clientes;