import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CarAnimation from '../components/CarAnimation';
import PasswordInput from '../components/PasswordInput';
import { useToast } from '../hooks/useToast';

function ClienteLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      const res = await axios.post('/api/cliente-auth/login', { email, password });
      localStorage.setItem('cliente_token', res.data.token);
      localStorage.setItem('cliente', JSON.stringify(res.data.cliente));
      showToast('Bienvenido/a ' + res.data.cliente.nombre, 'success');
      navigate('/cliente/panel');
    } catch (error) {
      showToast(error.response?.data?.error || 'Error al iniciar sesión', 'error');
      setCargando(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-badge">ST</div>
          <h1>Acceso de Clientes</h1>
          <p>Seguí el estado de tu vehículo desde tu cuenta</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="auth-field">
            <label>Email</label>
            <input className="auth-input" type="email" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="auth-field">
            <label>Contraseña</label>
            <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="auth-button" type="submit" disabled={cargando}>
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

               <div className="auth-switch">
          ¿Todavía no tenés cuenta? Pedila la próxima vez que visites el taller.
        </div>
        <div className="auth-help">
          ¿Olvidaste tu contraseña? Pedile al taller que te la restablezca.
        </div>
      </div>

      <CarAnimation />
    </div>
  );
}

export default ClienteLogin;