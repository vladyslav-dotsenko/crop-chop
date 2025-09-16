import { configureStore } from '@reduxjs/toolkit'
import imageCropperReducer from './slices/imageCropperSlice'
import frameSelectorReducer from './slices/frameSelectorSlice'

export const store = configureStore({
  reducer: {
    imageCropper: imageCropperReducer,
    frameSelector: frameSelectorReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
