import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Create favicon dynamically
const favicon = document.createElement('link')
favicon.rel = 'icon'
favicon.href = '/favicon.ico'
document.head.appendChild(favicon)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
