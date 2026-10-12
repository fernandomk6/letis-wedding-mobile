// Cores do painel administrativo (idênticas ao CSS do projeto web)
export const colors = {
  primary: '#244667',
  secondary: '#62809a',
  accent: '#88ccdd',
  border: '#d8e8f2',
  background: '#f8f9fa',
  muted: '#91aabf',
  white: '#ffffff',
  error: '#c62828',
  errorBg: '#ffebee',
  success: '#2e7d32'
};

export const gradients = {
  accent: ['#88ccdd', '#62809a'] as const,
  orange: ['#ff9800', '#f57c00'] as const,
  green: ['#4caf50', '#45a049'] as const,
  login: ['#d8e8f2', '#88ccdd'] as const
};

// Equivalente a linear-gradient(135deg, ...)
export const diagonal = { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } };
