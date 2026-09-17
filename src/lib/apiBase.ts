/** API gốc — dev: `/api/v1` (Vite proxy → BE); production: rewrite Vercel. */
export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_URL || '/api/v1'
  return raw.replace(/\/$/, '')
}
