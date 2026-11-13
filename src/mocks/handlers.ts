import { http, HttpResponse } from 'msw'
import { seedProducts } from '../features/products/seedProducts'
import type { Product } from '../features/products/types'

let inventory = seedProducts.map(product => ({ ...product }))
export function resetMockProducts() { inventory = seedProducts.map(product => ({ ...product })) }
export const handlers = [
  http.get('*/api/products', () => HttpResponse.json(inventory)),
  http.patch('*/api/products/:id', async ({ params, request }) => {
    const id = String(params.id)
    const body = await request.json() as { quantity?: unknown }
    const product = inventory.find(item => item.id === id)
    if (!product) return HttpResponse.json({ message: 'Товар не знайдено.' }, { status: 404 })
    if (!Number.isInteger(body.quantity) || Number(body.quantity) < 0) return HttpResponse.json({ message: 'Некоректна кількість.' }, { status: 400 })
    product.quantity = Number(body.quantity)
    product.updatedAt = new Date().toISOString().slice(0, 10)
    return HttpResponse.json(product)
  }),
  http.delete('*/api/products/:id', ({ params }) => {
    const before = inventory.length
    inventory = inventory.filter(item => item.id !== String(params.id))
    if (inventory.length === before) return HttpResponse.json({ message: 'Товар не знайдено.' }, { status: 404 })
    return HttpResponse.json({ success: true })
  }),
]

export type MockInventory = Product[]

