import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AmbientGlow } from './components/fx/AmbientGlow'
import { ScrollProgress } from './components/fx/ScrollProgress'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Cosmetic FX layers — fixed, pointer-events: none.
        Self-disable on touch devices and for prefers-reduced-motion. */}
    <AmbientGlow />
    <ScrollProgress />
    <App />
  </StrictMode>,
)
