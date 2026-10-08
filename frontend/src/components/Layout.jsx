import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Car, Wrench, Users, LayoutDashboard, Wallet, LogOut } from 'lucide-react';

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const linksPorRol = {
        admin: [
      { to: '/clientes-vehiculos', label: 'Clientes y Vehículos', icon: Car },
      { to: '/ordenes', label: 'Órdenes de Trabajo', icon: Wrench },
      { to: '/usuarios', label: 'Usuarios', icon: Users },
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/comisiones', label: 'Comisiones', icon: Wallet },
    ],


    vendedor: [
      { to: '/clientes-vehiculos', label: 'Clientes y Vehículos', icon: Car },
      { to: '/ordenes', label: 'Órdenes de Trabajo', icon: Wrench },
    ],
    tecnico: [
      { to: '/panel-tecnico', label: 'Mis Trabajos', icon: Wrench },
    ],
    cliente: [],
  };

  const links = linksPorRol[usuario?.rol] || [];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="auth-brand-badge">ST</div>
          <span>Sistema de Taller</span>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => {
            const Icono = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={'sidebar-link ' + (location.pathname === link.to ? 'active' : '')}
              >
                <Icono size={17} strokeWidth={2} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-name">{usuario?.nombre}</div>
            <div className="sidebar-user-role">{usuario?.rol}</div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            <LogOut size={15} strokeWidth={2} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <main className="app-content">{children}</main>
    </div>
  );
}

export default Layout;