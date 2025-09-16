import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Frame } from '../../types'

interface FrameSelectorState {
  selectedFrame: Frame | null
  availableFrames: Frame[]
  customFrames: Frame[]
  isFrameSelectorOpen: boolean
  isCustomFrameModalOpen: boolean
}

const initialState: FrameSelectorState = {
  selectedFrame: null,
  availableFrames: [],
  customFrames: [],
  isFrameSelectorOpen: false,
  isCustomFrameModalOpen: false
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
    },
    addCustomFrame: (state, action: PayloadAction<Frame>) => {
      state.customFrames.push(action.payload)
    },
    openCustomFrameModal: (state) => {
      state.isCustomFrameModalOpen = true
    },
    closeCustomFrameModal: (state) => {
      state.isCustomFrameModalOpen = false
    }
  }
})

export const {
  setAvailableFrames,
  selectFrame,
  openFrameSelector,
  closeFrameSelector,
  addCustomFrame,
  openCustomFrameModal,
  closeCustomFrameModal
} = frameSelectorSlice.actions

export default frameSelectorSlice.reducer
