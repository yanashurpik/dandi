export function maskApiKey(key: string): string {
  const parts = key.split('_');
  if (parts.length > 1) {
    return `${parts[0]}-${'*'.repeat(24)}`;
  }
  return `${key.substring(0, 4)}-${'*'.repeat(24)}`;
} 