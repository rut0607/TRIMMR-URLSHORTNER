// main.jsx - UPDATED
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Add error boundary wrapper
const ErrorBoundary = ({ children }) => {
  try {
    return children
  } catch (error) {
    console.error('Error in app:', error)
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Something went wrong</h1>
        <p>{error.message}</p>
      </div>
    )
  }
}

const root = createRoot(document.getElementById('root'))

root.render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
)