const COLORS = [
  '#e94560','#6c5ce7','#00b894','#fdcb6e','#e17055',
  '#0984e3','#d63031','#00cec9','#a29bfe','#fd79a8',
  '#2ecc71','#ff7675','#74b9ff','#fab1a0','#55efc4'
];

export function avatarColor(name: string): string {
  if (!name) return COLORS[0];
  const code = name.charCodeAt(0) + (name.charCodeAt(1) || 0);
  return COLORS[code % COLORS.length];
}