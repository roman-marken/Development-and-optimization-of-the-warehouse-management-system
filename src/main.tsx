import React from 'react'
import { createRoot } from 'react-dom/client'
import { WarehousePage } from './components/WarehousePage'
import './styles.css'

async function start() {
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser')
    await worker.start({ onUnhandledFrame: 'bypass' })
  }
  createRoot(document.getElementById('root')!).render(<React.StrictMode><WarehousePage/></React.StrictMode>)
}
void start()

