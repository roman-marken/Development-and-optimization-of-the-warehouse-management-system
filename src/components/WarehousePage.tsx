import { Profiler, useCallback, useEffect, useMemo, useState } from 'react'
import { List, type RowComponentProps } from 'react-window'
import { ProductRow, type ProductRowProps } from './ProductRow'
import { calculateInventoryValue, filterProducts } from '../features/products/productsUtils'
import type { Availability, Product } from '../features/products/types'
import { deleteProduct, fetchProducts, updateProductQuantity } from '../features/products/productsApi'

const currency = new Intl.NumberFormat('uk-UA', { style:'currency', currency:'UAH', maximumFractionDigits:0 })
type LoadState = 'loading'|'success'|'error'

export function WarehousePage() {
  const [products,setProducts]=useState<Product[]>([])
  const [loadState,setLoadState]=useState<LoadState>('loading')
  const [loadError,setLoadError]=useState('')
  const [actionError,setActionError]=useState('')
  const [notice,setNotice]=useState('')
  const [query,setQuery]=useState('')
  const [category,setCategory]=useState('all')
  const [availability,setAvailability]=useState<Availability>('all')
  const [pendingIds,setPendingIds]=useState<string[]>([])

  const load=useCallback(async()=>{setLoadState('loading');setLoadError('');try{setProducts(await fetchProducts());setLoadState('success')}catch(error){setLoadError(error instanceof Error?error.message:'Не вдалося завантажити товари.');setLoadState('error')}},[])
  useEffect(()=>{void load()},[load])

  const categories=useMemo(()=>[...new Set(products.map(product=>product.category))].sort((a,b)=>a.localeCompare(b,'uk')), [products])
  const visibleProducts=useMemo(()=>filterProducts(products,{query,category,availability}),[products,query,category,availability])
  const inventoryValue=useMemo(()=>calculateInventoryValue(products),[products])

  const adjust=useCallback(async(product:Product,delta:number)=>{
    setPendingIds(ids=>[...ids,product.id]);setActionError('');setNotice('')
    try{const updated=await updateProductQuantity(product.id,product.quantity+delta);setProducts(current=>current.map(item=>item.id===updated.id?updated:item));setNotice(`Залишок «${updated.name}» оновлено.`)}
    catch(error){setActionError(error instanceof Error?error.message:'Не вдалося оновити кількість.')}
    finally{setPendingIds(ids=>ids.filter(id=>id!==product.id))}
  },[])
  const remove=useCallback(async(product:Product)=>{
    setPendingIds(ids=>[...ids,product.id]);setActionError('');setNotice('')
    try{await deleteProduct(product.id);setProducts(current=>current.filter(item=>item.id!==product.id));setNotice(`«${product.name}» видалено зі складу.`)}
    catch(error){setActionError(error instanceof Error?error.message:'Не вдалося видалити товар.')}
    finally{setPendingIds(ids=>ids.filter(id=>id!==product.id))}
  },[])
  const rowProps=useMemo<ProductRowProps>(()=>({products:visibleProducts,pendingIds,onAdjust:adjust,onDelete:remove}),[visibleProducts,pendingIds,adjust,remove])
  const renderRow=useCallback((props:RowComponentProps<ProductRowProps>)=><ProductRow {...props}/>,[])
  const rowKey=useCallback((index:number,props:ProductRowProps)=>props.products[index]?.id||index,[ ])
  const profiler=useCallback((id:string,phase:string,actualDuration:number)=>{if(import.meta.env.DEV&&actualDuration>8)console.info(`[Profiler:${id}] ${phase}: ${actualDuration.toFixed(1)}ms`)},[])

  const lowCount=products.filter(product=>product.quantity>0&&product.quantity<=5).length
  const outCount=products.filter(product=>product.quantity===0).length
  const totalUnits=products.reduce((sum,product)=>sum+product.quantity,0)

  return <div className="workspace">
    <header className="topbar"><div className="brand"><span className="brand-icon">N</span><span>northstar <b>WAREHOUSE</b></span></div><div className="top-right"><span className="warehouse-label"><i/> Основний склад · Київ</span><button className="notification-button" aria-label="Сповіщення">♧<i/></button><span className="user-chip"><b>ІШ</b> Ірина Шевченко</span></div></header>
    <main className="main-content">
      <div className="page-heading"><div><div className="eyebrow">ОПЕРАЦІЙНИЙ ЦЕНТР / ЗАПАСИ</div><h1>Склад товарів</h1><p>Переглядайте позиції та керуйте складськими залишками.</p></div><button className="export-button" onClick={()=>setNotice('Звіт складу готовий до експорту.')}>↧ <span>Експорт звіту</span></button></div>
      <div className="summary-row"><Summary icon="▦" label="Усього одиниць" value={totalUnits.toLocaleString('uk-UA')} detail={`${products.length} товарних позицій`} tone="purple"/><Summary icon="◫" label="Оцінка запасів" value={currency.format(inventoryValue)} detail="За поточними цінами каталогу" tone="blue"/><Summary icon="!" label="Низький залишок" value={String(lowCount).padStart(2,'0')} detail="Потрібне поповнення" tone="amber"/><Summary icon="⊘" label="Немає на складі" value={String(outCount).padStart(2,'0')} detail="Позиції з нульовим залишком" tone="rose"/></div>
      <section className="inventory-panel"><div className="inventory-heading"><div><h2>Каталог запасів</h2><p>Список товарів у вашому складі</p></div><span className="updated-label"><i/> Дані синхронізовані</span></div>
        <div className="filter-bar"><label className="search-field"><span>⌕</span><input aria-label="Пошук товарів" placeholder="Пошук за назвою або артикулом..." value={query} onChange={event=>setQuery(event.target.value)}/><kbd>⌘ K</kbd></label><label className="select-filter"><span>Категорія</span><select aria-label="Фільтр категорії" value={category} onChange={event=>setCategory(event.target.value)}><option value="all">Усі категорії</option>{categories.map(value=><option key={value}>{value}</option>)}</select></label><label className="select-filter"><span>Наявність</span><select aria-label="Фільтр наявності" value={availability} onChange={event=>setAvailability(event.target.value as Availability)}><option value="all">Усі статуси</option><option value="in-stock">В наявності</option><option value="low-stock">Мало</option><option value="out-of-stock">Немає на складі</option></select></label></div>
        {(actionError||notice)&&<div className={`feedback ${actionError?'error':'success'}`} role={actionError?'alert':'status'}>{actionError||notice}<button onClick={()=>{setActionError('');setNotice('')}} aria-label="Закрити повідомлення">×</button></div>}
        <div className="table-header product-row"><span>ТОВАР</span><span>АРТИКУЛ</span><span>КАТЕГОРІЯ</span><span>КІЛЬКІСТЬ</span><span>ЦІНА</span><span>СТАТУС</span><span/></div>
        {loadState==='loading'&&<div className="state-message" role="status"><span className="spinner"/>Завантажуємо складські позиції…</div>}
        {loadState==='error'&&<div className="state-message error-state" role="alert"><b>Не вдалося завантажити склад</b><span>{loadError}</span><button onClick={()=>void load()}>Спробувати ще раз</button></div>}
        {loadState==='success'&&visibleProducts.length>0&&<Profiler id="VirtualizedInventoryList" onRender={profiler}><List className="virtual-list" rowComponent={renderRow} rowProps={rowProps} rowCount={visibleProducts.length} rowHeight={68} rowKey={rowKey} defaultHeight={476} overscanCount={5} style={{height:476,width:'100%'}}/></Profiler>}
        {loadState==='success'&&visibleProducts.length===0&&<div className="state-message empty-state">За вибраними фільтрами товарів не знайдено.</div>}
        <div className="table-footer"><span>Показано <b>{visibleProducts.length}</b> із <b>{products.length}</b> позицій</span><span>Оновлено щойно <i>●</i></span></div>
      </section>
      <footer className="page-footer"><span>© 2026 Northstar Operations</span><span>Складська система <b>v1.4.0</b></span></footer>
    </main>
  </div>
}

function Summary({icon,label,value,detail,tone}:{icon:string;label:string;value:string;detail:string;tone:string}){return <article className="summary-card"><span className={`summary-icon ${tone}`}>{icon}</span><div className="summary-label">{label}</div><strong>{value}</strong><small>{detail}</small></article>}

