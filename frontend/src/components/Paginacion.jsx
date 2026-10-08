function Paginacion({ paginaActual, totalPaginas, onCambiar }) {
  if (totalPaginas <= 1) return null;

  const paginas = Array.from({ length: totalPaginas }, (_, i) => i + 1);

  return (
    <div className="paginacion">
      <button className="paginacion-btn" disabled={paginaActual === 1} onClick={() => onCambiar(paginaActual - 1)}>
        Anterior
      </button>
      {paginas.map((p) => (
        <button
          key={p}
          className={'paginacion-btn' + (p === paginaActual ? ' activo' : '')}
          onClick={() => onCambiar(p)}
        >
          {p}
        </button>
      ))}
      <button className="paginacion-btn" disabled={paginaActual === totalPaginas} onClick={() => onCambiar(paginaActual + 1)}>
        Siguiente
      </button>
    </div>
  );
}

export default Paginacion;