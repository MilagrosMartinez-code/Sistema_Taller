import { createContext, useState, useCallback } from 'react';

export const ToastContext = createContext(null);

let idCounter = 0;

const ICONOS = { success: '✓', error: '✕', info: 'i' };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((mensaje, tipo) => {
    const id = ++idCounter;
    const tipoFinal = tipo || 'info';
    setToasts((actuales) => [...actuales, { id, mensaje, tipo: tipoFinal, saliendo: false }]);

    setTimeout(() => {
      setToasts((actuales) => actuales.map((t) => (t.id === id ? { ...t, saliendo: true } : t)));
      setTimeout(() => {
        setToasts((actuales) => actuales.filter((t) => t.id !== id));
      }, 350);
    }, 3200);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={'toast toast-' + t.tipo + (t.saliendo ? ' toast-saliendo' : '')}>
            <span className="toast-icono">{ICONOS[t.tipo]}</span>
            <span>{t.mensaje}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}