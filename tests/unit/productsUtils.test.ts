import { describe, expect, it } from 'vitest'
import { calculateInventoryValue, filterProducts, getAvailability, searchProducts } from '../../src/features/products/productsUtils'
import { seedProducts } from '../../src/features/products/seedProducts'

describe('product utilities',()=>{
  it('searches product names and SKUs case-insensitively',()=>{
    expect(searchProducts(seedProducts,'quiet pro').map(p=>p.id)).toEqual(['p4'])
    expect(searchProducts(seedProducts,'MN-ST27').map(p=>p.id)).toEqual(['p2'])
  })
  it('combines category and stock filters',()=>{
    expect(filterProducts(seedProducts,{category:'Аксесуари',availability:'low-stock'}).map(p=>p.id)).toEqual(['p9'])
    expect(filterProducts(seedProducts,{availability:'out-of-stock'}).map(p=>p.id)).toEqual(['p6'])
  })
  it('calculates total value of inventory',()=>{
    expect(calculateInventoryValue([{...seedProducts[0],price:100,quantity:3},{...seedProducts[1],price:25,quantity:4}])).toBe(400)
  })
  it('classifies stock availability at boundary values',()=>{
    expect(getAvailability(0)).toBe('out-of-stock')
    expect(getAvailability(5)).toBe('low-stock')
    expect(getAvailability(6)).toBe('in-stock')
  })
})

