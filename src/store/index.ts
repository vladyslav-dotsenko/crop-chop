import { configureStore } from '@reduxjs/toolkit'
import imageCropperReducer from './slices/imageCropperSlice'
import frameSelectorReducer from './slices/frameSelectorSlice'
import framesComposerReducer from './slices/framesComposerSlice'
import uiReducer from './slices/uiSlice'

export const store = configureStore({
  reducer: {
    imageCropper: imageCropperReducer,
    frameSelector: frameSelectorReducer,
    framesComposer: framesComposerReducer,
    ui: uiReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
