import { memo } from 'react'
import type { RowComponentProps } from 'react-window'
import type { Product } from '../features/products/types'

export type ProductRowProps = {
  products: Product[]
  pendingIds: string[]
  onAdjust: (product: Product, delta: number) => void
  onDelete: (product: Product) => void
}
const currency = new Intl.NumberFormat('uk-UA', { style: 'currency', currency: 'UAH', maximumFractionDigits: 0 })
const availability = (quantity:number) => quantity === 0 ? ['out','Немає на складі'] : quantity <= 5 ? ['low','Мало'] : ['in','В наявності']

export const ProductRow = memo(function ProductRow({ index, style, ariaAttributes, products, pendingIds, onAdjust, onDelete }: RowComponentProps<ProductRowProps>) {
  const product = products[index]
  if (!product) return null
  const [status,statusText] = availability(product.quantity)
  const pending = pendingIds.includes(product.id)
  return <div className="product-row" style={style} {...ariaAttributes}>
    <div className="product-name-cell"><span className="product-symbol">{product.category==='Дисплеї'?'▣':product.category==='Аудіо'?'◖':'◈'}</span><span><b>{product.name}</b><small>{product.category}</small></span></div>
    <code>{product.sku}</code>
    <span className="category-cell">{product.category}</span>
    <div className="stock-control"><button aria-label={`Зменшити ${product.name}`} disabled={pending||product.quantity===0} onClick={()=>onAdjust(product,-1)}>−</button><b aria-label={`Залишок ${product.name}`}>{product.quantity}</b><button aria-label={`Збільшити ${product.name}`} disabled={pending} onClick={()=>onAdjust(product,1)}>+</button></div>
    <span className="price-cell">{currency.format(product.price)}</span>
    <span className={`availability ${status}`}><i/>{statusText}</span>
    <button className="delete-product" aria-label={`Видалити ${product.name}`} disabled={pending} onClick={()=>onDelete(product)}>×</button>
  </div>
})

