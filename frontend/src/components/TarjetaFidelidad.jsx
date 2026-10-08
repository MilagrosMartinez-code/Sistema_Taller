function TarjetaFidelidad({ visitas, requeridas, descripcion, activa, compacta }) {
  if (!activa) return null;

  const circulos = Array.from({ length: requeridas }, (_, i) => i < visitas);
  const premioDisponible = visitas >= requeridas;

  return (
    <div className={'tarjeta-fidelidad' + (premioDisponible ? ' premio' : '') + (compacta ? ' compacta' : '')}>
      <div className="tarjeta-fidelidad-header">
        <span>Tarjeta de fidelidad</span>
        {premioDisponible && <span className="tarjeta-fidelidad-badge">¡Premio disponible!</span>}
      </div>
      <div className="tarjeta-fidelidad-circulos">
        {circulos.map((lleno, i) => (
          <div key={i} className={'circulo-visita' + (lleno ? ' lleno' : '') + (i === requeridas - 1 ? ' especial' : '')}>
            {lleno ? (i === requeridas - 1 ? '★' : '✓') : ''}
          </div>
        ))}
      </div>
      <div className="tarjeta-fidelidad-footer">
        {Math.min(visitas, requeridas)} / {requeridas} visitas — {descripcion}
      </div>
    </div>
  );
}

export default TarjetaFidelidad;