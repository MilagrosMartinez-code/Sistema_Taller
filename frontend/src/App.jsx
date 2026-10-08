import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ClientesVehiculos from './pages/ClientesVehiculos';
import Ordenes from './pages/Ordenes';
import PanelTecnico from './pages/PanelTecnico';
import Seguimiento from './pages/Seguimiento';
import Usuarios from './pages/Usuarios';
import Dashboard from './pages/Dashboard';
import Comisiones from './pages/Comisiones';
import Totem from './pages/Totem';
import ClienteLogin from './pages/ClienteLogin';
import ClienteRegistro from './pages/ClienteRegistro';
import ClientePanel from './pages/ClientePanel';
import EstadoBoxes from './pages/EstadoBoxes';

function RutaProtegida({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/seguimiento/:codigo" element={<Seguimiento />} />
        <Route path="/totem" element={<Totem />} />
        <Route path="/cliente/login" element={<ClienteLogin />} />
        <Route path="/cliente/registro" element={<ClienteRegistro />} />
        <Route path="/cliente/panel" element={<ClientePanel />} />
        <Route path="/clientes-vehiculos" element={<RutaProtegida><ClientesVehiculos /></RutaProtegida>} />
        <Route path="/ordenes" element={<RutaProtegida><Ordenes /></RutaProtegida>} />
        <Route path="/panel-tecnico" element={<RutaProtegida><PanelTecnico /></RutaProtegida>} />
        <Route path="/usuarios" element={<RutaProtegida><Usuarios /></RutaProtegida>} />
        <Route path="/dashboard" element={<RutaProtegida><Dashboard /></RutaProtegida>} />
        <Route path="/comisiones" element={<RutaProtegida><Comisiones /></RutaProtegida>} />
        <Route path="/cliente/boxes" element={<EstadoBoxes />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;