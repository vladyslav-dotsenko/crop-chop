import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface UiState {
  isSaveModalOpen: boolean
}

const initialState: UiState = {
  isSaveModalOpen: false
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSaveModalOpen(state, action: PayloadAction<boolean>) {
      state.isSaveModalOpen = action.payload
    }
  }
})

export const { setSaveModalOpen } = uiSlice.actions
export default uiSlice.reducer


