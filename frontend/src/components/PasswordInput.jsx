import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

function PasswordInput({ name, value, onChange, placeholder, required }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-input-wrapper">
      <input
        className="auth-input"
        type={visible ? 'text' : 'password'}
        name={name}
        placeholder={placeholder || '••••••••'}
        value={value}
        onChange={onChange}
        required={required}
      />
      <button
        type="button"
        className="password-toggle-btn"
        onClick={() => setVisible(!visible)}
        tabIndex={-1}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

export default PasswordInput;