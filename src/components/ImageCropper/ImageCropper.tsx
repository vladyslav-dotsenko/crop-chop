import React, { useRef, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../../store'
import { setIsDragging, setLastMousePosition, setImageScale, setImagePosition } from '../../store/slices'

export interface ImageCropperProps {
  frameWidth?: number
  frameHeight?: number
  zoomStep?: number
  maxScale?: number
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  frameWidth = 300,
  frameHeight = 200,
  zoomStep = 0.05,
  maxScale = 5
}) => {
  const dispatch = useDispatch()
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const {
    originalImage,
    imagePosition,
    imageScale,
    isDragging,
    lastMousePosition
  } = useSelector((state: RootState) => state.imageCropper)

  // Reusable function to clamp image position within frame bounds
  const clampImagePosition = useCallback((
    position: { x: number; y: number },
    imageWidth: number,
    imageHeight: number,
    scale: number
  ) => {
    // Calculate scaled image dimensions
    const scaledImageWidth = imageWidth * scale
    const scaledImageHeight = imageHeight * scale
    
    // Calculate panning bounds
    // The image should not be panned so that the frame shows empty space
    const maxOffsetX = Math.max(0, (scaledImageWidth - frameWidth) / 2)
    const maxOffsetY = Math.max(0, (scaledImageHeight - frameHeight) / 2)
    const minOffsetX = -maxOffsetX
    const minOffsetY = -maxOffsetY
    
    // Apply panning constraints
    return {
      x: Math.max(minOffsetX, Math.min(maxOffsetX, position.x)),
      y: Math.max(minOffsetY, Math.min(maxOffsetY, position.y))
    }
  }, [frameWidth, frameHeight])
  
  // Center the image when it's first loaded
  React.useEffect(() => {
    if (originalImage && imageRef.current) {
      const img = imageRef.current
      
      // Get original image actual size from the img element
      const imageWidth = img.naturalWidth
      const imageHeight = img.naturalHeight
      
      // Frame dimensions (centered frame) - using configurable values
      
      // Calculate scale to fit frame with "object-fit: cover" behavior
      // This means scale to cover the entire frame while maintaining aspect ratio
      const scaleX = frameWidth / imageWidth
      const scaleY = frameHeight / imageHeight
      const initialScale = Math.max(scaleX, scaleY) // Use the larger scale to ensure coverage
      
      // Set initial position to (0, 0) - centering will be handled in transform calculation
      dispatch(setImagePosition({ x: 0, y: 0 }))
      dispatch(setImageScale(initialScale))
    }
  }, [originalImage, dispatch, frameWidth, frameHeight])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!originalImage) return
    e.preventDefault()
    dispatch(setIsDragging(true))
    dispatch(setLastMousePosition({ x: e.clientX, y: e.clientY }))
  }, [dispatch, originalImage])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !lastMousePosition || !originalImage || !imageRef.current) return
    e.preventDefault()
    
    const deltaX = e.clientX - lastMousePosition.x
    const deltaY = e.clientY - lastMousePosition.y
    
    const img = imageRef.current
    const imageWidth = img.naturalWidth
    const imageHeight = img.naturalHeight
    
    // Calculate new position with delta
    const newPosition = {
      x: imagePosition.x + deltaX,
      y: imagePosition.y + deltaY
    }
    
    // Apply panning constraints using the reusable clamping function
    const clampedPosition = clampImagePosition(newPosition, imageWidth, imageHeight, imageScale)
    
    dispatch(setImagePosition(clampedPosition))
    dispatch(setLastMousePosition({ x: e.clientX, y: e.clientY }))
  }, [dispatch, isDragging, lastMousePosition, originalImage, imagePosition, imageScale, clampImagePosition])

  const handleMouseUp = useCallback(() => {
    dispatch(setIsDragging(false))
    dispatch(setLastMousePosition(null))
  }, [dispatch])

  // Debounced wheel handler to prevent lag from rapid wheel events
  const wheelDeltaRef = useRef(0)
  const lastWheelTimeRef = useRef(0)
  const wheelTimeoutRef = useRef<number | null>(null)
  
  const processWheelDelta = useCallback(() => {
    if (!originalImage || !imageRef.current || wheelDeltaRef.current === 0) return
    
    const img = imageRef.current
    const imageWidth = img.naturalWidth
    const imageHeight = img.naturalHeight
    
    // Calculate minimum scale where image covers the frame (object-fit: cover behavior)
    const minScaleX = frameWidth / imageWidth
    const minScaleY = frameHeight / imageHeight
    const minScale = Math.max(minScaleX, minScaleY)
    
    // Calculate zoom step that is capped at zoomStep maximum
    // At zoom >= 1: use full zoomStep
    // At zoom < 1: use smaller steps for fine control when zoomed out
    const relativeZoomStep = Math.min(zoomStep, zoomStep * imageScale)
    
    const delta = wheelDeltaRef.current > 0 ? -relativeZoomStep : relativeZoomStep
    const newScale = Math.max(minScale, Math.min(maxScale, imageScale + delta))
    
    // Apply offset clamping after zooming to ensure frame doesn't overlap image borders
    if (newScale !== imageScale) {
      // Clamp current position to new bounds using the reusable clamping function
      const clampedPosition = clampImagePosition(imagePosition, imageWidth, imageHeight, newScale)
      
      // Update both scale and position
      dispatch(setImageScale(newScale))
      dispatch(setImagePosition(clampedPosition))
    } else {
      dispatch(setImageScale(newScale))
    }
    
    // Reset accumulated delta
    wheelDeltaRef.current = 0
  }, [dispatch, imageScale, originalImage, frameWidth, frameHeight, zoomStep, maxScale, imagePosition, clampImagePosition])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!originalImage || !imageRef.current) return
    
    // Accumulate wheel delta
    wheelDeltaRef.current += e.deltaY
    
    const now = Date.now()
    const timeSinceLastUpdate = now - lastWheelTimeRef.current
    const minUpdateInterval = 1000 / 30 // 30 updates per second = ~33ms between updates
    
    // Clear any existing timeout
    if (wheelTimeoutRef.current) {
      clearTimeout(wheelTimeoutRef.current)
    }
    
    // If enough time has passed since last update, process immediately
    if (timeSinceLastUpdate >= minUpdateInterval) {
      lastWheelTimeRef.current = now
      processWheelDelta()
    } else {
      // Otherwise, schedule an update after the minimum interval
      wheelTimeoutRef.current = setTimeout(() => {
        lastWheelTimeRef.current = Date.now()
        processWheelDelta()
      }, minUpdateInterval - timeSinceLastUpdate)
    }
  }, [originalImage, processWheelDelta])

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current)
      }
    }
  }, [])

  if (!originalImage) {
    return (
      <div className="image-cropper no-image">
        <p>Please upload an image to start cropping</p>
      </div>
    )
  }

  // Calculate the transform with centering
  // We need to account for the scaled image dimensions
  const imageWidth = imageRef.current?.naturalWidth || 0
  const imageHeight = imageRef.current?.naturalHeight || 0
  const containerDimensions = containerRef.current?.getBoundingClientRect() || { width: 0, height: 0 }

  const transformX = imagePosition.x
    - (imageWidth * imageScale / 2)
    + (containerDimensions.width / 2)

  const transformY = imagePosition.y
    - (imageHeight * imageScale / 2)
    + (containerDimensions.height / 2)

  return (
    <div
      ref={containerRef}
      className="image-cropper"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <div
        className="image-container"
        style={{
          transform: `translate(${transformX}px, ${transformY}px) scale(${imageScale})`,
        }}
      >
        <img
          ref={imageRef}
          src={originalImage}
          alt="Crop target"
          draggable={false}
        />
      </div>
      
      <div className="crop-frame" />
      
      <div className="crop-overlay" />
      
      {/* Debug zoom display */}
      <div 
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: '#00ff00',
          padding: '8px 12px',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '14px',
          zIndex: 1000,
          pointerEvents: 'none'
        }}
      >
        Zoom: {imageScale.toFixed(3)}
      </div>
    </div>
  )
}

export default ImageCropper
