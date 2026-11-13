import type { Availability, Product, ProductFilters } from './types'

export function getAvailability(quantity: number): Exclude<Availability, 'all'> {
  if (quantity <= 0) return 'out-of-stock'
  if (quantity <= 5) return 'low-stock'
  return 'in-stock'
}

export function searchProducts(products: Product[], query = ''): Product[] {
  const term = query.trim().toLocaleLowerCase('uk-UA')
  if (!term) return products
  return products.filter(product => `${product.name} ${product.sku}`.toLocaleLowerCase('uk-UA').includes(term))
}

export function filterProducts(products: Product[], filters: ProductFilters): Product[] {
  const searched = searchProducts(products, filters.query)
  return searched.filter(product => {
    const matchesCategory = !filters.category || filters.category === 'all' || product.category === filters.category
    const matchesAvailability = !filters.availability || filters.availability === 'all' || getAvailability(product.quantity) === filters.availability
    return matchesCategory && matchesAvailability
  })
}

export function calculateInventoryValue(products: Product[]): number {
  return products.reduce((total, product) => total + product.price * product.quantity, 0)
}

