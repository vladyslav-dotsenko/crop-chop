import { useEffect, useRef, useCallback, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../../store'
import type { Frame } from '../../types'
import {
  setIsDragging,
  setLastMousePosition,
  setImageScale,
  setImagePosition,
} from '../../store/slices'
import { clampImagePosition } from '../../utils'

export interface ImageCropperCoreProps {
  originalImage: string
  frameWidth?: number
  frameHeight?: number
  selectedFrame?: Frame | null
  zoomStep?: number
  maxScale?: number
}

const ImageCropperCore: React.FC<ImageCropperCoreProps> = ({
  originalImage,
  frameWidth = 300,
  frameHeight = 200,
  selectedFrame = null,
  zoomStep = 0.05,
  maxScale = 5
}) => {
  const dispatch = useDispatch()
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerLoaded, setContainerLoaded] = useState(false)
  const [tempPanPosition, setTempPanPosition] = useState<{ x: number; y: number } | null>(null)

  // Calculate crop frame dimensions based on frame type
  const getCropFrameDimensions = useCallback(() => {
    if (selectedFrame && selectedFrame.layers) {
      // Find the art area layer
      const artAreaLayer = selectedFrame.layers.find(layer => 
        layer.type === 'image' && layer.properties.imageUrl === '{{croppedImage}}'
      )
      
      if (artAreaLayer) {
        return {
          width: artAreaLayer.properties.width || frameWidth,
          height: artAreaLayer.properties.height || frameHeight
        }
      }
    }
    
    // Fallback to full frame dimensions
    return { width: frameWidth, height: frameHeight }
  }, [selectedFrame, frameWidth, frameHeight])

  const cropDimensions = getCropFrameDimensions()

  useEffect(() => {
    setContainerLoaded(true)
  }, [containerRef.current])

  // Clear temporary position when image changes
  useEffect(() => {
    setTempPanPosition(null)
  }, [originalImage])

  const {
    images,
    selectedImageKey,
    isDragging,
    lastMousePosition,
  } = useSelector((state: RootState) => state.imageCropper)

  // Get the currently selected image data
  const selectedImage = selectedImageKey ? images[selectedImageKey] : null
  const imagePosition = selectedImage?.imagePosition || { x: 0, y: 0 }
  const imageScale = selectedImage?.imageScale || 1
  const naturalWidth = selectedImage?.naturalWidth || 0
  const naturalHeight = selectedImage?.naturalHeight || 0
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!originalImage) return
    e.preventDefault()
    dispatch(setIsDragging(true))
    dispatch(setLastMousePosition({ x: e.clientX, y: e.clientY }))
  }, [dispatch, originalImage])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !lastMousePosition || !originalImage) return
    e.preventDefault()
    
    const deltaX = e.clientX - lastMousePosition.x
    const deltaY = e.clientY - lastMousePosition.y
    
    const currentPosition = tempPanPosition || imagePosition

    // Calculate new position with delta
    const newPosition = {
      x: currentPosition.x + deltaX,
      y: currentPosition.y + deltaY
    }
    
    // Apply panning constraints using the reusable clamping function
    const clampedPosition = clampImagePosition(
      newPosition,
      naturalWidth,
      naturalHeight,
      imageScale,
      cropDimensions.width,
      cropDimensions.height,
    )
    
    setTempPanPosition(clampedPosition)
    dispatch(setLastMousePosition({ x: e.clientX, y: e.clientY }))
  }, [dispatch, isDragging, lastMousePosition, originalImage, imagePosition, imageScale, cropDimensions, naturalWidth, naturalHeight])

  const handleMouseUp = useCallback(() => {
    if (tempPanPosition) {
      dispatch(setImagePosition(tempPanPosition))
      setTempPanPosition(null)
    }
    dispatch(setIsDragging(false))
    dispatch(setLastMousePosition(null))
  }, [dispatch, tempPanPosition])

  // Debounced wheel handler to prevent lag from rapid wheel events
  const wheelDeltaRef = useRef(0)
  const lastWheelTimeRef = useRef(0)
  const wheelTimeoutRef = useRef<number | null>(null)
  
  const processWheelDelta = useCallback(() => {
    if (!originalImage || wheelDeltaRef.current === 0) return
    
    // Calculate minimum scale where image covers the frame (object-fit: cover behavior)
    const minScaleX = frameWidth / naturalWidth
    const minScaleY = frameHeight / naturalHeight
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
      const clampedPosition = clampImagePosition(
        imagePosition,
        naturalWidth,
        naturalHeight,
        newScale,
        cropDimensions.width,
        cropDimensions.height,
      )
      
      // Update both scale and position
      dispatch(setImageScale(newScale))
      dispatch(setImagePosition(clampedPosition))
    } else {
      dispatch(setImageScale(newScale))
    }
    
    // Reset accumulated delta
    wheelDeltaRef.current = 0
  }, [dispatch, imageScale, originalImage, frameWidth, frameHeight, zoomStep, maxScale, imagePosition, naturalWidth, naturalHeight])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!originalImage) return
    
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
  useEffect(() => {
    return () => {
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current)
      }
    }
  }, [])

  // Calculate the transform with centering
  // We need to account for the scaled image dimensions
  const containerDimensions = containerRef.current?.getBoundingClientRect() || { width: 0, height: 0 }

  // Use temporary position when dragging for immediate visual feedback
  const currentPosition = tempPanPosition || imagePosition

  const transformX = currentPosition.x
    - (naturalWidth * imageScale / 2)
    + (containerDimensions.width / 2)

  const transformY = currentPosition.y
    - (naturalHeight * imageScale / 2)
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
      {containerLoaded && (
        <>
          <div
            className="image-container"
            style={{
              transform: `translate(${transformX}px, ${transformY}px) scale(${imageScale})`,
            }}
          >
            <img
              src={originalImage}
              alt="Crop target"
              draggable={false}
            />
          </div>
          
          <div
            className="crop-frame"
            style={{
              width: cropDimensions.width,
              height: cropDimensions.height,
            }}
          />
          
          <div className="crop-overlay" />
          
          {/* Debug zoom and offset display */}
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
              pointerEvents: 'none',
              lineHeight: '1.4'
            }}
          >
            <div>Zoom: {imageScale.toFixed(3)}</div>
            <div>Offset: ({currentPosition.x.toFixed(1)}, {currentPosition.y.toFixed(1)})</div>
          </div>
        </>
      )}
    </div>
  )
}

export default ImageCropperCore
