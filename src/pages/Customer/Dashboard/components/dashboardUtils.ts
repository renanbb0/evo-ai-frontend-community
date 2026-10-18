export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatSeconds = (value: number | null) => {
  if (value == null || !Number.isFinite(value)) return '—';
  if (!value || value <= 0) return '0s';
  const rounded = Math.round(value);
  if (rounded < 60) return `${rounded}s`;

  const minutes = Math.floor(rounded / 60);
  const seconds = rounded % 60;
  return `${minutes}min ${seconds}s`;
};
