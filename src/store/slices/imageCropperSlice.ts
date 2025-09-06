import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

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

interface ImageState {
  originalImage: string | null
  imagePosition: { x: number; y: number }
  imageScale: number
  isDragging: boolean
  lastMousePosition: { x: number; y: number } | null
  filename: string
}

const initialState: ImageState = {
  originalImage: null,
  imagePosition: { x: 0, y: 0 },
  imageScale: 1,
  isDragging: false,
  lastMousePosition: null,
  filename: 'cropped-image',
}

const imageCropperSlice = createSlice({
  name: 'imageCropper',
  initialState,
  reducers: {
    setOriginalImage: (state, action: PayloadAction<{ imageUrl: string; filename?: string }>) => {
      state.originalImage = action.payload.imageUrl
      // Reset position and scale when new image is loaded
      state.imagePosition = { x: 0, y: 0 }
      state.imageScale = 1
      // Set filename based on uploaded image or provided filename
      state.filename = action.payload.filename || extractFilename(action.payload.imageUrl)
    },
    setImagePosition: (state, action: PayloadAction<{ x: number; y: number }>) => {
      state.imagePosition = action.payload
    },
    setImageScale: (state, action: PayloadAction<number>) => {
      state.imageScale = Math.max(0.1, Math.min(5, action.payload))
    },
    setIsDragging: (state, action: PayloadAction<boolean>) => {
      state.isDragging = action.payload
    },
    setLastMousePosition: (state, action: PayloadAction<{ x: number; y: number } | null>) => {
      state.lastMousePosition = action.payload
    },
    setFilename: (state, action: PayloadAction<string>) => {
      state.filename = action.payload
    }
  }
})

export const {
  setOriginalImage,
  setImagePosition,
  setImageScale,
  setIsDragging,
  setLastMousePosition,
  setFilename,
} = imageCropperSlice.actions

export default imageCropperSlice.reducer
