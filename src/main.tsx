import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './site/App'
import './styles.css'
import './search.css'
import './admin.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><BrowserRouter><App /></BrowserRouter></React.StrictMode>,
)
