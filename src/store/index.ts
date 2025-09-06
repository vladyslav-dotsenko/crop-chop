import { configureStore } from '@reduxjs/toolkit'
import imageCropperReducer from './slices/imageCropperSlice'

export const store = configureStore({
  reducer: {
    imageCropper: imageCropperReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
