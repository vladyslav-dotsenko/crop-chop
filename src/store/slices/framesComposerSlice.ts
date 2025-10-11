import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ComposerState } from '../../types'
import { selectFrame } from './frameSelectorSlice'

const initialState: ComposerState = {
  frameParameters: {},
  selectedExportSizes: ['original'],
  exportFormat: 'png',
  customFrameJson: '',
  exportCroppedOnly: false
}

const framesComposerSlice = createSlice({
  name: 'framesComposer',
  initialState,
  reducers: {
    setFrameParameters: (state, action: PayloadAction<{ frameId: string; parameters: Record<string, string> }>) => {
      const { frameId, parameters } = action.payload
      state.frameParameters[frameId] = parameters
    },
    updateFrameParameter: (state, action: PayloadAction<{ frameId: string; parameterId: string; value: string }>) => {
      const { frameId, parameterId, value } = action.payload
      
      if (!state.frameParameters[frameId]) {
        state.frameParameters[frameId] = {}
      }
      
      state.frameParameters[frameId][parameterId] = value
    },
    toggleExportSize: (state, action: PayloadAction<string>) => {
      const size = action.payload
      const index = state.selectedExportSizes.indexOf(size)
      if (index > -1) {
        state.selectedExportSizes.splice(index, 1)
      } else {
        state.selectedExportSizes.push(size)
      }
    },
    setExportSizes: (state, action: PayloadAction<string[]>) => {
      state.selectedExportSizes = action.payload
    },
    setExportFormat: (state, action: PayloadAction<'png' | 'webp'>) => {
      state.exportFormat = action.payload
    },
    setExportCroppedOnly: (state, action: PayloadAction<boolean>) => {
      state.exportCroppedOnly = action.payload
    },
    setCustomFrameJson: (state, action: PayloadAction<string>) => {
      state.customFrameJson = action.payload
    },
    clearFrameParameters: (state, action: PayloadAction<string>) => {
      delete state.frameParameters[action.payload]
    },
    resetComposerState: (state) => {
      state.frameParameters = {}
      state.selectedExportSizes = ['original']
      state.exportFormat = 'png'
      state.customFrameJson = ''
      state.exportCroppedOnly = false
    }
  },
  extraReducers: (builder) => {
    builder.addCase(selectFrame, (state, action) => {
      const frame = action.payload
      if (frame && frame.parameters && frame.parameters.length > 0) {
        // Initialize frame parameters with default values if not already set
        if (!state.frameParameters[frame.id]) {
          const defaultParams: Record<string, string> = {}
          frame.parameters.forEach(param => {
            defaultParams[param.id] = String(param.defaultValue ?? '')
          })
          state.frameParameters[frame.id] = defaultParams
        }
      }
    })
  }
})

export const {
  setFrameParameters,
  updateFrameParameter,
  toggleExportSize,
  setExportSizes,
  setExportFormat,
  setExportCroppedOnly,
  setCustomFrameJson,
  clearFrameParameters,
  resetComposerState
} = framesComposerSlice.actions

export default framesComposerSlice.reducer

