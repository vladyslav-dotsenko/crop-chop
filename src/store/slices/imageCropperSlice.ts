import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { v4 as uuidv4 } from 'uuid'

// Utility function to extract filename from URL or data URL
const extractFilename = (url: string): string => {
  try {
    // Handle data URLs (e.g., "data:image/jpeg;base64,...")
    if (url.startsWith('data:')) {
      return 'cropped-image'
    }
    
    // Handle regular URLs
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const filename = pathname.split('/').pop() || 'cropped-image'
    
    // Remove file extension for the base filename
    return filename.replace(/\.[^/.]+$/, '')
  } catch {
    // Fallback if URL parsing fails
    return 'cropped-image'
  }
}

interface ImageData {
  originalImage: string
  imagePosition: { x: number; y: number }
  imageScale: number
  filename: string
  isInitialized: boolean
  naturalWidth: number
  naturalHeight: number
}

interface ImageState {
  images: Record<string, ImageData> // Map of filename to image data
  selectedImageKey: string | null
  isDragging: boolean
  lastMousePosition: { x: number; y: number } | null
}

const initialState: ImageState = {
  images: {},
  selectedImageKey: null,
  isDragging: false,
  lastMousePosition: null,
}

const imageCropperSlice = createSlice({
  name: 'imageCropper',
  initialState,
  reducers: {
    addImage: (state, action: PayloadAction<{ imageUrl: string; filename?: string }>) => {
      const filename = action.payload.filename || extractFilename(action.payload.imageUrl)
      const uniqueKey = uuidv4()
      
      state.images[uniqueKey] = {
        originalImage: action.payload.imageUrl,
        imagePosition: { x: 0, y: 0 },
        imageScale: 1,
        filename: filename,
        isInitialized: false,
        naturalWidth: 0,
        naturalHeight: 0
      }
      
      // Select the newly added image
      state.selectedImageKey = uniqueKey
    },
    selectImage: (state, action: PayloadAction<string>) => {
      if (state.images[action.payload]) {
        state.selectedImageKey = action.payload
      }
    },
    removeImage: (state, action: PayloadAction<string>) => {
      delete state.images[action.payload]
      
      // If we removed the selected image, select another one or clear selection
      if (state.selectedImageKey === action.payload) {
        const remainingKeys = Object.keys(state.images)
        state.selectedImageKey = remainingKeys.length > 0 ? remainingKeys[0] : null
      }
    },
    setImagePosition: (state, action: PayloadAction<{ x: number; y: number }>) => {
      if (state.selectedImageKey && state.images[state.selectedImageKey]) {
        state.images[state.selectedImageKey].imagePosition = action.payload
      }
    },
    setImageScale: (state, action: PayloadAction<number>) => {
      if (state.selectedImageKey && state.images[state.selectedImageKey]) {
        state.images[state.selectedImageKey].imageScale = Math.max(0.1, Math.min(5, action.payload))
      }
    },
    setIsDragging: (state, action: PayloadAction<boolean>) => {
      state.isDragging = action.payload
    },
    setLastMousePosition: (state, action: PayloadAction<{ x: number; y: number } | null>) => {
      state.lastMousePosition = action.payload
    },
    updateImageFilename: (state, action: PayloadAction<{ imageKey: string; filename: string }>) => {
      const { imageKey, filename } = action.payload
      if (state.images[imageKey]) {
        state.images[imageKey].filename = filename
      }
    },
    markImageAsInitialized: (state, action: PayloadAction<{ imageKey: string; naturalWidth: number; naturalHeight: number }>) => {
      const { imageKey, naturalWidth, naturalHeight } = action.payload
      if (state.images[imageKey]) {
        state.images[imageKey].isInitialized = true
        state.images[imageKey].naturalWidth = naturalWidth
        state.images[imageKey].naturalHeight = naturalHeight
      }
    },
    resetAllImages: (state) => {
      state.images = {}
      state.selectedImageKey = null
      state.isDragging = false
      state.lastMousePosition = null
    }
  }
})

export const {
  addImage,
  selectImage,
  removeImage,
  setImagePosition,
  setImageScale,
  setIsDragging,
  setLastMousePosition,
  updateImageFilename,
  markImageAsInitialized,
  resetAllImages,
} = imageCropperSlice.actions

export default imageCropperSlice.reducer
