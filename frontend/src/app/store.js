import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from '@reduxjs/toolkit'

// Import all slices
import authReducer from './features/authSlice'
import productReducer from './features/productSlice'
import bookingReducer from './features/bookingSlice'
import orderReducer from './features/orderSlice'
import customerReducer from './features/customerSlice'
import reportReducer from './features/reportSlice'
import notificationReducer from './features/notificationSlice'
import paymentReducer from './features/paymentSlice'
import invoiceReducer from './features/invoiceSlice'
import pricelistReducer from './features/pricelistSlice'
import reviewReducer from './features/reviewSlice'
import uiReducer from './features/uiSlice'
import adminReducer from './features/adminSlice'

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth', 'ui'], // Only persist auth and ui state
}

// Combine all reducers
const rootReducer = combineReducers({
  auth: authReducer,
  products: productReducer,
  bookings: bookingReducer,
  orders: orderReducer,
  customers: customerReducer,
  reports: reportReducer,
  notifications: notificationReducer,
  payments: paymentReducer,
  invoices: invoiceReducer,
  pricelists: pricelistReducer,
  reviews: reviewReducer,
  ui: uiReducer,
  admin: adminReducer,
})

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer)

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
})

// Create persistor
export const persistor = persistStore(store)

// Export for development tools (commented out since this is JS, not TS)
// export type RootState = ReturnType<typeof store.getState>
// export type AppDispatch = typeof store.dispatch
