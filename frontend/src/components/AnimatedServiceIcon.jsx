import { Droplets, Siren, Music, Contrast, Wrench } from 'lucide-react';

function RuedaIcon({ size, strokeWidth }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={strokeWidth || 1.8} />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth={strokeWidth || 1.8} />
      <line x1="12" y1="2" x2="12" y2="8.5" stroke="currentColor" strokeWidth={strokeWidth || 1.8} />
      <line x1="12" y1="15.5" x2="12" y2="22" stroke="currentColor" strokeWidth={strokeWidth || 1.8} />
      <line x1="2" y1="12" x2="8.5" y2="12" stroke="currentColor" strokeWidth={strokeWidth || 1.8} />
      <line x1="15.5" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth={strokeWidth || 1.8} />
    </svg>
  );
}

const CONFIG = {
  'Polarizado': { Icono: Contrast, clase: 'anim-pulso', color: '#7c3aed' },
  'Multimedia & Audio': { Icono: Music, clase: 'anim-rebote', color: '#6366f1' },
  'Llantas & Neumáticos': { Icono: RuedaIcon, clase: 'anim-giro', color: '#a855f7' },
  'Alarmas & Seguridad Vehicular': { Icono: Siren, clase: 'anim-sirena', color: '#dc2626' },
  'Detailing & Lavado': { Icono: Droplets, clase: 'anim-goteo', color: '#38bdf8' },
};

function AnimatedServiceIcon({ servicio, size = 28 }) {
  const config = CONFIG[servicio] || { Icono: Wrench, clase: 'anim-giro', color: '#8b8598' };
  const { Icono, clase, color } = config;
  return (
    <div className={'animated-service-icon ' + clase} style={{ color }}>
      <Icono size={size} strokeWidth={1.8} />
    </div>
  );
}

export default AnimatedServiceIcon;