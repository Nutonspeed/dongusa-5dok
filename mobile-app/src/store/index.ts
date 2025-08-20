import AsyncStorage from "@react-native-async-storage/async-storage";
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { persistReducer, persistStore } from "redux-persist";

// Import reducers
import appConfigSlice from "./slices/appConfigSlice";
import authSlice from "./slices/authSlice";
import cartSlice from "./slices/cartSlice";
import ordersSlice from "./slices/ordersSlice";
import productsSlice from "./slices/productsSlice";

// Import API slice
import { apiSlice } from "./api/apiSlice";

// Persist configuration
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["auth", "cart", "appConfig"], // Only persist these slices
  blacklist: ["api"], // Don't persist API cache
};

// Root reducer
const rootReducer = {
  auth: authSlice,
  products: productsSlice,
  cart: cartSlice,
  orders: ordersSlice,
  appConfig: appConfigSlice,
  [apiSlice.reducerPath]: apiSlice.reducer,
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/FLUSH",
          "persist/REHYDRATE",
          "persist/PAUSE",
          "persist/PERSIST",
          "persist/PURGE",
          "persist/REGISTER",
        ],
      },
    }).concat(apiSlice.middleware),
  devTools: __DEV__,
});

// Setup listeners for refetchOnFocus/refetchOnReconnect
setupListeners(store.dispatch);

// Create persistor
export const persistor = persistStore(store);

// Export types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
