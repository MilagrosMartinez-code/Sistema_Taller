import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import CarAnimation from '../components/CarAnimation';
import PasswordInput from '../components/PasswordInput';
import { useToast } from '../hooks/useToast';

const DESTINO_POR_ROL = {
  admin: '/clientes-vehiculos',
  vendedor: '/clientes-vehiculos',
  tecnico: '/panel-tecnico',
  cliente: '/login',
};

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setCargando(true);

    try {
      const response = await axios.post('/api/login', { email, password });
      const { token, usuario } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('usuario', JSON.stringify(usuario));

      showToast('Bienvenido/a ' + usuario.nombre, 'success');
      navigate(DESTINO_POR_ROL[usuario.rol] || '/login');
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
          <h1>Sistema de Taller</h1>
          <p>Control y seguimiento de vehículos</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="auth-field">
            <label>Email</label>
            <input
              className="auth-input"
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
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
          ¿No tenés cuenta? <Link to="/register">Registrate</Link>
        </div>
        <div className="auth-help">
          ¿Olvidaste tu contraseña? Pedile a un administrador que te la restablezca.
        </div>
      </div>

      <CarAnimation />
    </div>
  );
}

export default Login;