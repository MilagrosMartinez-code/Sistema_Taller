import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CarAnimation from '../components/CarAnimation';
import PasswordInput from '../components/PasswordInput';
import PasswordChecklist, { passwordEsValida } from '../components/PasswordChecklist';
import { useToast } from '../hooks/useToast';

function Register() {
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'vendedor' });
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!passwordEsValida(form.password)) {
      showToast('La contraseña debe cumplir los 3 requisitos', 'error');
      return;
    }

    setCargando(true);
    try {
      await axios.post('/api/register', form);
      showToast('Usuario creado correctamente', 'success');
      setTimeout(() => navigate('/login'), 900);
    } catch (error) {
      showToast(error.response?.data?.error || 'Error al registrar', 'error');
      setCargando(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-badge">ST</div>
          <h1>Crear cuenta</h1>
          <p>Registro de usuarios del sistema</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Nombre completo</label>
            <input className="auth-input" name="nombre" placeholder="Nombre y apellido" onChange={handleChange} required />
          </div>
          <div className="auth-field">
            <label>Email</label>
            <input className="auth-input" name="email" type="email" placeholder="tu@correo.com" onChange={handleChange} required />
          </div>
          <div className="auth-field">
            <label>Contraseña</label>
            <PasswordInput name="password" value={form.password} onChange={handleChange} required />
            <PasswordChecklist password={form.password} />
          </div>
          <div className="auth-field">
            <label>Rol</label>
            <select className="auth-input" name="rol" value={form.rol} onChange={handleChange}>
              <option value="admin">Administrador</option>
              <option value="vendedor">Vendedor</option>
              <option value="tecnico">Técnico</option>
            </select>
          </div>
          <button className="auth-button" type="submit" disabled={cargando}>
            {cargando ? 'Creando cuenta...' : 'Registrarme'}
          </button>
        </form>

        <div className="auth-switch">
          ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
        </div>
      </div>

      <CarAnimation />
    </div>
  );
}

export default Register;