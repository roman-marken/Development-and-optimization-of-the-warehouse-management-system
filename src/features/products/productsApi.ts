import type { Product } from './types'
const endpoint = () => new URL('/api/products', window.location.origin).toString()
async function readResponse<T>(response: Response): Promise<T> {
  if (!response.ok) { const body = await response.json().catch(() => ({})) as { message?: string }; throw new Error(body.message || `Помилка сервера (${response.status})`) }
  return response.json() as Promise<T>
}
export async function fetchProducts(): Promise<Product[]> { return readResponse<Product[]>(await fetch(endpoint())) }
export async function updateProductQuantity(id: string, quantity: number): Promise<Product> { return readResponse<Product>(await fetch(`${endpoint()}/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ quantity }) })) }
export async function deleteProduct(id: string): Promise<void> { await readResponse<{ success: boolean }>(await fetch(`${endpoint()}/${encodeURIComponent(id)}`, { method: 'DELETE' })) }

