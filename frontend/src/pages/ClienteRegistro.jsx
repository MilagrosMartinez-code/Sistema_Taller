import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PasswordInput from '../components/PasswordInput';
import PasswordChecklist, { passwordEsValida } from '../components/PasswordChecklist';
import { useToast } from '../hooks/useToast';

function ClienteRegistro() {
  const [searchParams] = useSearchParams();
  const codigo = searchParams.get('codigo');
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!codigo) {
      setError('Falta el código de tu orden en el link.');
      return;
    }
    axios.get('/api/cliente-auth/prefill/' + codigo)
      .then((res) => setDatos(res.data))
      .catch(() => setError('No pudimos encontrar tu orden.'));
  }, [codigo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passwordEsValida(password)) {
      showToast('La contraseña debe cumplir los 3 requisitos', 'error');
      return;
    }
    if (password !== password2) {
      showToast('Las contraseñas no coinciden', 'error');
      return;
    }
    setCargando(true);
    try {
      await axios.post('/api/cliente-auth/registro', { cliente_id: datos.cliente_id, password });
      showToast('Cuenta creada correctamente', 'success');
      setTimeout(() => navigate('/cliente/login'), 900);
    } catch (error) {
      showToast(error.response?.data?.error || 'Error al crear la cuenta', 'error');
      setCargando(false);
    }
  };

  if (error) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!datos) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <p style={{ color: '#8b8598' }}>Cargando...</p>
        </div>
      </div>
    );
  }

  if (datos.yaRegistrado) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          <div className="auth-brand-badge" style={{ margin: '0 auto 14px' }}>ST</div>
          <p style={{ marginBottom: '16px' }}>Ya tenés una cuenta creada con este email.</p>
          <Link to="/cliente/login" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Iniciar sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-badge">ST</div>
          <h1>Creá tu cuenta</h1>
          <p>Solo te falta elegir una contraseña</p>
        </div>

        <div className="datos-precargados">
          <div><strong>Nombre:</strong> {datos.nombre}</div>
          <div><strong>Email:</strong> {datos.email || '—'}</div>
          <div><strong>Teléfono:</strong> {datos.telefono || '—'}</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label>Contraseña</label>
            <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} required />
            <PasswordChecklist password={password} />
          </div>
          <div className="auth-field">
            <label>Repetir contraseña</label>
            <PasswordInput value={password2} onChange={(e) => setPassword2(e.target.value)} required />
          </div>
          <button className="auth-button" type="submit" disabled={cargando}>
            {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ClienteRegistro;