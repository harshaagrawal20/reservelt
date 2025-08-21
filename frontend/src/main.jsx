import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { ClerkProvider } from '@clerk/clerk-react'
import './index.css'
import App from './App.jsx'
import { store, persistor } from './app/store'

// Get Clerk publishable key from environment variables
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!clerkPubKey) {
  throw new Error('Missing Clerk Publishable Key')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <Provider store={store}>
        <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
          <App />
        </PersistGate>
      </Provider>
    </ClerkProvider>
  </StrictMode>,
)
