// Paletas de cores da lista pública.
// primary: textos e elementos escuros | secondary: textos de apoio e gradientes
// accent: destaques e botões | light: bordas e fundos suaves | background: fundo da página
export const DEFAULT_PALETTE_ID = 'azul-classico';

export type Palette = {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  light: string;
  background: string;
};

export const PALETTES: Palette[] = [
  { id: 'azul-classico', name: 'Azul Clássico', primary: '#244667', secondary: '#62809a', accent: '#88ccdd', light: '#d8e8f2', background: '#f8f9fa' },
  { id: 'azul-marinho-dourado', name: 'Azul Marinho e Dourado', primary: '#1b2a49', secondary: '#7a6a3a', accent: '#c9a54c', light: '#efe4c4', background: '#fbf8f0' },
  { id: 'azul-serenity', name: 'Azul Serenity', primary: '#3b5b82', secondary: '#7f9cc0', accent: '#92a8d1', light: '#dfe7f3', background: '#f6f8fc' },
  { id: 'rosa-blush', name: 'Rosa Blush', primary: '#7a3e4d', secondary: '#b5707f', accent: '#e8a9b5', light: '#f9dfe4', background: '#fff8f9' },
  { id: 'rose-gold', name: 'Rose Gold', primary: '#6d4147', secondary: '#a8727a', accent: '#d9a79b', light: '#f3dcd5', background: '#fdf8f6' },
  { id: 'rosa-antigo', name: 'Rosa Antigo', primary: '#5e3b44', secondary: '#9c6b78', accent: '#c99aa5', light: '#efd9de', background: '#fbf6f7' },
  { id: 'marsala', name: 'Marsala e Champagne', primary: '#6b2737', secondary: '#964a58', accent: '#d4b483', light: '#f1e3cf', background: '#fcf8f2' },
  { id: 'bordo', name: 'Bordô e Rosé', primary: '#561c2c', secondary: '#8a3a50', accent: '#d58a9c', light: '#f4d8df', background: '#fdf6f8' },
  { id: 'verde-sage', name: 'Verde Sage', primary: '#3f5243', secondary: '#7f9a83', accent: '#a8bfa6', light: '#e1ebdf', background: '#f7faf6' },
  { id: 'verde-eucalipto', name: 'Verde Eucalipto', primary: '#2f4a44', secondary: '#5f8179', accent: '#9bbfb2', light: '#dcebe6', background: '#f5faf8' },
  { id: 'verde-esmeralda', name: 'Verde Esmeralda e Dourado', primary: '#14473a', secondary: '#3f7a66', accent: '#c9a54c', light: '#e5dcb8', background: '#f8faf5' },
  { id: 'verde-oliva', name: 'Verde Oliva', primary: '#4a4f2a', secondary: '#7c8450', accent: '#b5bd7f', light: '#e8ebd0', background: '#fafbf3' },
  { id: 'lavanda', name: 'Lavanda', primary: '#4e3f6b', secondary: '#8574a8', accent: '#b9a9d9', light: '#e8e1f4', background: '#faf8fd' },
  { id: 'lilas-vintage', name: 'Lilás Vintage', primary: '#5a4560', secondary: '#957a9c', accent: '#c8afce', light: '#eee2f0', background: '#fbf8fb' },
  { id: 'terracota', name: 'Terracota', primary: '#6b3a28', secondary: '#a8624a', accent: '#d9936f', light: '#f2dccf', background: '#fdf8f4' },
  { id: 'pessego-coral', name: 'Pêssego e Coral', primary: '#7a4033', secondary: '#c0705f', accent: '#f2a48c', light: '#fcdfd3', background: '#fffaf7' },
  { id: 'dourado-champagne', name: 'Champagne e Dourado', primary: '#5c4a2a', secondary: '#9a8250', accent: '#d4b774', light: '#f2e8cf', background: '#fdfaf3' },
  { id: 'amarelo-sol', name: 'Amarelo e Girassol', primary: '#5e4a14', secondary: '#a8872a', accent: '#f0c64a', light: '#faf0c4', background: '#fffdf2' },
  { id: 'tiffany', name: 'Azul Tiffany', primary: '#1f5b5c', secondary: '#4f9a9b', accent: '#81d8d0', light: '#d6f2ee', background: '#f5fcfb' },
  { id: 'azul-petroleo', name: 'Azul Petróleo', primary: '#173f4a', secondary: '#3f7684', accent: '#79aebb', light: '#d3e6eb', background: '#f5fafb' },
  { id: 'cinza-elegante', name: 'Cinza Elegante', primary: '#33373d', secondary: '#6c7480', accent: '#aab2bd', light: '#e3e6ea', background: '#f8f9fa' },
  { id: 'preto-dourado', name: 'Preto e Dourado', primary: '#1c1c1c', secondary: '#5d5438', accent: '#c9a54c', light: '#ece2c2', background: '#faf8f2' },
  { id: 'neutro-areia', name: 'Neutro / Areia', primary: '#4a4036', secondary: '#8c7e6f', accent: '#c4b5a0', light: '#ebe4d8', background: '#fbf9f6' },
  { id: 'azul-royal', name: 'Azul Royal e Prata', primary: '#1d3a8a', secondary: '#5d78c2', accent: '#aab4c8', light: '#dde3f3', background: '#f7f8fc' },
  { id: 'azul-bebe', name: 'Azul Bebê', primary: '#3d6a8a', secondary: '#79a6c7', accent: '#a9d1ec', light: '#e1f0fa', background: '#f7fbfe' },
  { id: 'azul-cobalto-laranja', name: 'Azul Índigo e Pêssego', primary: '#2b3a67', secondary: '#6572a3', accent: '#f0a27c', light: '#fbe0d1', background: '#fbf8f6' },
  { id: 'azul-denim', name: 'Azul Jeans', primary: '#2f4560', secondary: '#5c7a9c', accent: '#8fb0cf', light: '#dae5f0', background: '#f6f9fc' },
  { id: 'rosa-chiclete', name: 'Rosa Pink', primary: '#8a2150', secondary: '#c2487e', accent: '#f08cb5', light: '#fbd9e8', background: '#fff7fb' },
  { id: 'rosa-salmao', name: 'Rosa Salmão', primary: '#8a3b3b', secondary: '#c8715f', accent: '#f4a896', light: '#fbddd5', background: '#fff8f6' },
  { id: 'rosa-e-verde', name: 'Rosa e Verde Menta', primary: '#6b3a4a', secondary: '#4f8f7a', accent: '#f2b2c3', light: '#d9efe6', background: '#fcf8f9' },
  { id: 'rosa-mauve', name: 'Mauve', primary: '#5b3a4f', secondary: '#936c85', accent: '#c9a0b8', light: '#f0dfe8', background: '#fbf7f9' },
  { id: 'vermelho-classico', name: 'Vermelho Clássico', primary: '#7a1620', secondary: '#b3323f', accent: '#e46a74', light: '#f8d7da', background: '#fff7f7' },
  { id: 'vinho-dourado', name: 'Vinho e Dourado', primary: '#4a1427', secondary: '#7d3a50', accent: '#c9a54c', light: '#ecdcc0', background: '#fbf7f1' },
  { id: 'coral-vivo', name: 'Coral Vivo', primary: '#8a2f2a', secondary: '#d1584a', accent: '#ff8a75', light: '#ffdcd3', background: '#fffaf8' },
  { id: 'laranja-queimado', name: 'Laranja Queimado', primary: '#6e3414', secondary: '#b5622e', accent: '#e8944f', light: '#f8dfc6', background: '#fffaf4' },
  { id: 'cobre', name: 'Cobre', primary: '#5a3322', secondary: '#9b5e3f', accent: '#c98a64', light: '#f0d9c8', background: '#fcf7f3' },
  { id: 'mostarda', name: 'Mostarda', primary: '#5b4410', secondary: '#9a7a1d', accent: '#d9a82e', light: '#f6e8bd', background: '#fffcf0' },
  { id: 'marrom-cafe', name: 'Café e Creme', primary: '#3e2b22', secondary: '#7a5a49', accent: '#b89a84', light: '#eadfd4', background: '#fbf8f4' },
  { id: 'verde-musgo', name: 'Verde Musgo', primary: '#2d3b22', secondary: '#5d7048', accent: '#8fa574', light: '#dde6d2', background: '#f6f8f2' },
  { id: 'verde-floresta', name: 'Verde Floresta', primary: '#1a3a2a', secondary: '#3d6b52', accent: '#6fa586', light: '#d3e6da', background: '#f4faf6' },
  { id: 'verde-menta', name: 'Verde Menta', primary: '#2f5c4a', secondary: '#5fa88a', accent: '#a8dcc4', light: '#dff4ea', background: '#f6fcf9' },
  { id: 'verde-limao', name: 'Verde Limão', primary: '#3d5212', secondary: '#7a9a24', accent: '#b6d44a', light: '#e8f2c4', background: '#fafdf0' },
  { id: 'verde-e-rosa', name: 'Verde Sage e Rosa Antigo', primary: '#3f5243', secondary: '#9c6b78', accent: '#d9a5b2', light: '#e6ede3', background: '#f9faf7' },
  { id: 'azul-e-verde', name: 'Azul e Verde Sage', primary: '#2f4a6b', secondary: '#6f8f7d', accent: '#a3bfa8', light: '#dbe6ea', background: '#f6f9f9' },
  { id: 'roxo-ameixa', name: 'Ameixa', primary: '#42214f', secondary: '#7a4a8c', accent: '#b27fc4', light: '#ead9f0', background: '#fbf7fc' },
  { id: 'roxo-ultra', name: 'Roxo e Dourado', primary: '#3a2160', secondary: '#6a4aa0', accent: '#c9a54c', light: '#e5dcf2', background: '#faf8fd' },
  { id: 'lilas-e-rosa', name: 'Lilás e Rosa', primary: '#523a6b', secondary: '#a07ab8', accent: '#e3a6c9', light: '#f1e2f0', background: '#fcf8fc' },
  { id: 'grafite-rosa', name: 'Grafite e Rosa', primary: '#2f3238', secondary: '#6b6f78', accent: '#e0a0ae', light: '#f4dde2', background: '#fafafa' },
  { id: 'preto-branco', name: 'Preto e Branco', primary: '#111111', secondary: '#555555', accent: '#9a9a9a', light: '#e6e6e6', background: '#ffffff' },
  { id: 'prata', name: 'Prata e Azul Gelo', primary: '#3b4756', secondary: '#78879a', accent: '#b4c2d2', light: '#e4eaf1', background: '#f8fafc' },
  { id: 'bege-nude', name: 'Nude', primary: '#5a4538', secondary: '#9a806f', accent: '#cfb4a1', light: '#f0e4da', background: '#fcf8f5' },
  { id: 'pastel-candy', name: 'Pastel (Candy)', primary: '#5a4a6b', secondary: '#8fa6c9', accent: '#f5b8c9', light: '#e4f3e9', background: '#fffafc' },
  { id: 'boho', name: 'Boho Rústico', primary: '#5c3d2e', secondary: '#9a7b4f', accent: '#c4825e', light: '#eadcc2', background: '#fbf6ee' },
  { id: 'jardim-pessego', name: 'Jardim Encantado', primary: '#4a5a3a', secondary: '#8aa070', accent: '#f2b8a2', light: '#f9e6dc', background: '#fefaf6' },
];


export const getPalette = (id?: string | null): Palette =>
  PALETTES.find((p) => p.id === id) || PALETTES[0];

// Famílias de cor (pela cor primária) para organizar e filtrar o seletor
export const COLOR_FAMILIES = [
  { id: 'azul', label: 'Azul', swatch: '#3b6ea5' },
  { id: 'verde', label: 'Verde', swatch: '#4f8a5b' },
  { id: 'vermelho', label: 'Vermelho / Rosa', swatch: '#b5495b' },
  { id: 'roxo', label: 'Roxo', swatch: '#7a5aa8' },
  { id: 'laranja', label: 'Laranja / Marrom', swatch: '#b8683e' },
  { id: 'amarelo', label: 'Amarelo / Dourado', swatch: '#d4a82f' },
  { id: 'neutro', label: 'Neutro', swatch: '#777777' },
];

const hexToHsl = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s, l };
};

export const getColorFamily = (palette: Palette) => {
  const { h, s } = hexToHsl(palette.primary);
  if (s < 0.12) return 'neutro';
  if (h >= 335 || h < 10) return 'vermelho';
  if (h < 38) return 'laranja';
  if (h < 62) return 'amarelo';
  if (h < 170) return 'verde';
  if (h < 255) return 'azul';
  return 'roxo';
};

// Paletas ordenadas por família (ordem de COLOR_FAMILIES) e depois por matiz
export const PALETTES_BY_FAMILY = [...PALETTES]
  .map((p) => ({ ...p, family: getColorFamily(p), hue: hexToHsl(p.primary).h }))
  .sort((a, b) => {
    const fa = COLOR_FAMILIES.findIndex((f) => f.id === a.family);
    const fb = COLOR_FAMILIES.findIndex((f) => f.id === b.family);
    return fa - fb || a.hue - b.hue;
  });
