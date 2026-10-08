import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import MARCAS_MODELOS from '../data/marcasModelos';

const MARCAS = Object.keys(MARCAS_MODELOS);

function Vehiculos() {
  const [vehiculos, setVehiculos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState({ cliente_id: '', marca: '', modelo: '', anio: '', chasis: '', placa: '' });
  const [editandoId, setEditandoId] = useState(null);

  const cargarDatos = async () => {
    const [resVehiculos, resClientes] = await Promise.all([
      axios.get('http://localhost:5000/api/vehiculos'),
      axios.get('http://localhost:5000/api/clientes')
    ]);
    setVehiculos(resVehiculos.data);
    setClientes(resClientes.data);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const modelosDisponibles = MARCAS_MODELOS[form.marca] || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editandoId) {
      await axios.put(`http://localhost:5000/api/vehiculos/${editandoId}`, form);
    } else {
      await axios.post('http://localhost:5000/api/vehiculos', form);
    }
    setForm({ cliente_id: '', marca: '', modelo: '', anio: '', chasis: '', placa: '' });
    setEditandoId(null);
    cargarDatos();
  };

  const handleEditar = (v) => {
    setForm({ cliente_id: v.cliente_id, marca: v.marca, modelo: v.modelo, anio: v.anio || '', chasis: v.chasis || '', placa: v.placa || '' });
    setEditandoId(v.id);
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar este vehículo?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/vehiculos/${id}`);
      cargarDatos();
    } catch (error) {
      alert(error.response?.data?.error || 'Error al eliminar');
    }
  };

  return (
    <Layout>
      <div className="dashboard-card">
        <h3>{editandoId ? 'Editar vehículo' : 'Nuevo vehículo'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <select className="auth-input" name="cliente_id" value={form.cliente_id} onChange={handleChange} required>
              <option value="">Seleccionar cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>

            <input
              className="auth-input"
              name="marca"
              placeholder="Marca (empezá a escribir...)"
              list="lista-marcas"
              value={form.marca}
              onChange={handleChange}
              required
            />
            <datalist id="lista-marcas">
              {MARCAS.map((m) => <option key={m} value={m} />)}
            </datalist>

            <input
              className="auth-input"
              name="modelo"
              placeholder="Modelo (empezá a escribir...)"
              list="lista-modelos"
              value={form.modelo}
              onChange={handleChange}
              required
            />
            <datalist id="lista-modelos">
              {modelosDisponibles.map((m) => <option key={m} value={m} />)}
              <option value="Otro" />
            </datalist>
          </div>
          <div className="form-row" style={{ marginTop: '10px' }}>
            <input className="auth-input" name="anio" placeholder="Año" value={form.anio} onChange={handleChange} />
            <input className="auth-input" name="chasis" placeholder="Chasis" value={form.chasis} onChange={handleChange} />
            <input className="auth-input" name="placa" placeholder="Placa" value={form.placa} onChange={handleChange} />
            <button className="btn-primary" type="submit">{editandoId ? 'Guardar' : 'Agregar'}</button>
          </div>
        </form>
      </div>

      <div className="dashboard-card">
        <h3>Vehículos registrados</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Marca</th>
              <th>Modelo</th>
              <th>Año</th>
              <th>Placa</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {vehiculos.map((v) => (
              <tr key={v.id}>
                <td>{v.cliente_nombre}</td>
                <td>{v.marca}</td>
                <td>{v.modelo}</td>
                <td>{v.anio || '—'}</td>
                <td>{v.placa || '—'}</td>
                <td>
                  <button className="btn-icon edit" onClick={() => handleEditar(v)}>Editar</button>
                  <button className="btn-icon delete" onClick={() => handleEliminar(v.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

export default Vehiculos;