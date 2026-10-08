import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

function QRCodigo({ valor, tamano = 180 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && valor) {
      QRCode.toCanvas(canvasRef.current, valor, {
        width: tamano,
        margin: 1,
        color: { dark: '#1a1625', light: '#ffffff' }
      });
    }
  }, [valor, tamano]);

  return <canvas ref={canvasRef} />;
}

export default QRCodigo;