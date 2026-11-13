import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse, delay } from 'msw'
import { server } from '../../src/mocks/server'
import { resetMockProducts } from '../../src/mocks/handlers'
import { WarehousePage } from '../../src/components/WarehousePage'

describe('warehouse inventory workflow', () => {
  beforeEach(() => resetMockProducts())
  afterEach(() => cleanup())

  it('loads products and searches by name or SKU', async () => {
    const user=userEvent.setup();render(<WarehousePage/>)
    expect(screen.getByRole('status')).toHaveTextContent('Завантажуємо')
    const search=screen.getByRole('textbox',{name:'Пошук товарів'})
    await user.type(search,'MN-ST27')
    expect(await screen.findByText('Монітор Studio 27″')).toBeInTheDocument()
    expect(screen.queryByText('Навушники Quiet Pro')).not.toBeInTheDocument()
    expect(screen.getByText(/Показано/)).toBeInTheDocument()
  })

  it('filters by category and stock availability', async () => {
    const user=userEvent.setup();render(<WarehousePage/>);await screen.findByText('Бездротова клавіатура K380')
    await user.selectOptions(screen.getByRole('combobox',{name:'Фільтр категорії'}),'Аксесуари')
    await user.selectOptions(screen.getByRole('combobox',{name:'Фільтр наявності'}),'low-stock')
    expect(await screen.findByText('Док-станція Pro Dock')).toBeInTheDocument()
    expect(screen.queryByText('Підставка для ноутбука')).not.toBeInTheDocument()
  })

  it('updates quantity through the mocked API', async () => {
    const user=userEvent.setup();render(<WarehousePage/>);await screen.findByText('Бездротова клавіатура K380')
    await user.click(screen.getByRole('button',{name:'Збільшити Бездротова клавіатура K380'}))
    await waitFor(()=>expect(screen.getByLabelText('Залишок Бездротова клавіатура K380')).toHaveTextContent('43'))
    expect(await screen.findByRole('status')).toHaveTextContent('оновлено')
  })

  it('deletes a product through the mocked API', async () => {
    const user=userEvent.setup();render(<WarehousePage/>);await screen.findByText('Навушники Quiet Pro')
    await user.click(screen.getByRole('button',{name:'Видалити Навушники Quiet Pro'}))
    await waitFor(()=>expect(screen.queryByText('Навушники Quiet Pro')).not.toBeInTheDocument())
    expect(await screen.findByRole('status')).toHaveTextContent('видалено зі складу')
  })

  it('shows loading, then a server error and a retry control', async () => {
    server.use(http.get('*/api/products',async()=>{await delay(60);return HttpResponse.json({message:'Сервер складу тимчасово недоступний.'},{status:503})}))
    render(<WarehousePage/>)
    expect(screen.getByRole('status')).toHaveTextContent('Завантажуємо')
    expect(await screen.findByRole('alert')).toHaveTextContent('тимчасово недоступний')
    expect(screen.getByRole('button',{name:'Спробувати ще раз'})).toBeInTheDocument()
  })

  it('renders an empty result when filters have no match', async () => {
    const user=userEvent.setup();render(<WarehousePage/>);await screen.findByText('Бездротова клавіатура K380')
    await user.type(screen.getByRole('textbox',{name:'Пошук товарів'}),'not-a-real-product')
    expect(await screen.findByText('За вибраними фільтрами товарів не знайдено.')).toBeInTheDocument()
  })
})

