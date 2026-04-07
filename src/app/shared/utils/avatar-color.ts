// src/app/shared/utils/avatar-color.ts

/**
 * Generates a consistent gradient background for a given name
 */
export function avatarColor(name: string): string {
  if (!name) return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  
  // Hash the name to get a consistent number
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Predefined gradient pairs (good contrast with white text)
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Pink
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Blue
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // Green
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Rose-Yellow
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', // Cyan-Purple
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // Teal-Pink
    'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)', // Red-Yellow
    'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)', // Magenta-Orange
    'linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)', // Light Blue-Blue
  ];
  
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}