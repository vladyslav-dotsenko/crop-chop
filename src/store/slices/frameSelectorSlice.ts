import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Frame } from '../../types'

interface FrameSelectorState {
  selectedFrame: Frame | null
  availableFrames: Frame[]
  isFrameSelectorOpen: boolean
}

const initialState: FrameSelectorState = {
  selectedFrame: null,
  availableFrames: [],
  isFrameSelectorOpen: false
}

const frameSelectorSlice = createSlice({
  name: 'frameSelector',
  initialState,
  reducers: {
    setAvailableFrames: (state, action: PayloadAction<Frame[]>) => {
      state.availableFrames = action.payload
    },
    selectFrame: (state, action: PayloadAction<Frame>) => {
      state.selectedFrame = action.payload
      state.isFrameSelectorOpen = false
    },
    openFrameSelector: (state) => {
      state.isFrameSelectorOpen = true
    },
    closeFrameSelector: (state) => {
      state.isFrameSelectorOpen = false
    }
  }
})

export const {
  setAvailableFrames,
  selectFrame,
  openFrameSelector,
  closeFrameSelector
} = frameSelectorSlice.actions

export default frameSelectorSlice.reducer
