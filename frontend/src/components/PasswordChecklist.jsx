import { Check, Circle } from 'lucide-react';

export function passwordEsValida(password) {
  return password.length >= 6 && /[A-Za-z]/.test(password) && /\d/.test(password);
}

function PasswordChecklist({ password }) {
  if (password.length === 0) return null;

  const tieneLongitud = password.length >= 6;
  const tieneLetra = /[A-Za-z]/.test(password);
  const tieneNumero = /\d/.test(password);
  const criteriosCumplidos = [tieneLongitud, tieneLetra, tieneNumero].filter(Boolean).length;

  let nivelFuerza = 'debil';
  if (criteriosCumplidos === 2) nivelFuerza = 'media';
  if (criteriosCumplidos === 3) nivelFuerza = 'fuerte';

  return (
    <>
      <div className="password-strength-bar">
        <div className={'password-strength-segmento' + (criteriosCumplidos >= 1 ? ' activo-' + nivelFuerza : '')} />
        <div className={'password-strength-segmento' + (criteriosCumplidos >= 2 ? ' activo-' + nivelFuerza : '')} />
        <div className={'password-strength-segmento' + (criteriosCumplidos >= 3 ? ' activo-' + nivelFuerza : '')} />
      </div>
      <div className="password-checklist">
        <div className={'password-check-item' + (tieneLongitud ? ' cumplido' : '')}>
          {tieneLongitud ? <Check size={13} /> : <Circle size={13} />} Mínimo 6 caracteres
        </div>
        <div className={'password-check-item' + (tieneLetra ? ' cumplido' : '')}>
          {tieneLetra ? <Check size={13} /> : <Circle size={13} />} Al menos una letra
        </div>
        <div className={'password-check-item' + (tieneNumero ? ' cumplido' : '')}>
          {tieneNumero ? <Check size={13} /> : <Circle size={13} />} Al menos un número
        </div>
      </div>
    </>
  );
}

export default PasswordChecklist;