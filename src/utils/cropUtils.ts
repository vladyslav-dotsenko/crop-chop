import type { Frame, CropArea } from '../types'

export interface CropDimensions {
  width: number
  height: number
  x: number
  y: number
}

/**
 * Get crop area dimensions from frame configuration
 * Uses explicit cropArea config if available, falls back to full frame dimensions
 */
export const getCropAreaDimensions = (frame: Frame | null, frameWidth: number, frameHeight: number): CropDimensions => {
  if (frame?.cropArea) {
    return {
      width: frame.cropArea.width,
      height: frame.cropArea.height,
      x: frame.cropArea.x || 0,
      y: frame.cropArea.y || 0
    }
  }
  
  // Fallback to full frame dimensions for backward compatibility
  return {
    width: frameWidth,
    height: frameHeight,
    x: 0,
    y: 0
  }
}

/**
 * Calculate maximum scale based on crop area dimensions
 * This ensures the scale limiter uses crop area size instead of whole frame size
 */
export const calculateMaxScale = (imageWidth: number, imageHeight: number, cropWidth: number, cropHeight: number): number => {
  // Calculate the maximum scale that would make the image fill the crop area
  const scaleX = cropWidth / imageWidth
  const scaleY = cropHeight / imageHeight
  
  // Use the larger scale to ensure the image covers the entire crop area
  const minScaleToFill = Math.max(scaleX, scaleY)
  
  // Apply a reasonable maximum scale limit (e.g., 5x)
  return Math.min(minScaleToFill * 5, 10)
}

