export type Product = { id: string; name: string; sku: string; category: string; quantity: number; price: number; updatedAt: string }
export type Availability = 'all' | 'in-stock' | 'low-stock' | 'out-of-stock'
export type ProductFilters = { query?: string; category?: string; availability?: Availability }

