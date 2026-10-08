export function textoCola(orden) {
  const pos = orden.posicion_cola;
  if (!pos || pos <= 1) return 'Sos el siguiente';
  return `${pos - 1} vehículo(s) por delante`;
}

export const BADGE_CLASE = {
  'En Cola': 'badge-cola',
  'En Proceso': 'badge-proceso',
  'Finalizado': 'badge-finalizado',
  'Entregado': 'badge-entregado',
  'Cancelado': 'badge-cancelado',
};