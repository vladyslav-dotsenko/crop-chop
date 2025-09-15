import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../../store'
import ImageCropperCore from '../ImageCropperCore'
import { clampImagePosition } from '../../utils'
import { setImageScale, setImagePosition, markImageAsInitialized } from '../../store/slices'

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
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const { images, selectedImageKey } = useSelector((state: RootState) => state.imageCropper)

  // Get the currently selected image data
  const selectedImage = selectedImageKey ? images[selectedImageKey] : null
  const originalImage = selectedImage?.originalImage || null

  // Handle image loading and initialization
  React.useEffect(() => {
    if (originalImage && selectedImageKey) {
      if (!!selectedImage?.isInitialized) return
      setIsLoading(true)
      setIsImageLoaded(false)
      
      const img = new Image()
      
      img.onload = () => {
        if (!img.naturalWidth || !img.naturalHeight) return
        if (!selectedImageKey) return
        if (!!selectedImage?.isInitialized) return
    
        const initialScale = Math.max(frameWidth / img.naturalWidth, frameHeight / img.naturalHeight)
    
        const initialPosition = clampImagePosition(
          { x: 0, y: 0 },
          img.naturalWidth,
          img.naturalHeight,
          initialScale,
          frameWidth,
          frameHeight,
        )

        dispatch(setImageScale(initialScale))
        dispatch(setImagePosition(initialPosition))
        dispatch(markImageAsInitialized({ 
          imageKey: selectedImageKey, 
          naturalWidth: img.naturalWidth, 
          naturalHeight: img.naturalHeight 
        }))

        setIsImageLoaded(true)
        setIsLoading(false)
      }
      
      img.onerror = () => {
        setIsLoading(false)
        console.error('Failed to load image')
      }
      
      img.src = originalImage
    } else {
      setIsImageLoaded(false)
      setIsLoading(false)
    }
  }, [originalImage, selectedImageKey])

  // Show loading state
  if (isLoading) {
    return (
      <div className="image-cropper loading">
        <div className="loading-content">
          <div className="loading-spinner" />
          <p>Loading image...</p>
        </div>
      </div>
    )
  }

  // Show no image state
  if (!originalImage) {
    return (
      <div className="image-cropper no-image">
        <p>Please upload an image to start cropping</p>
      </div>
    )
  }

  // Show the cropper core when image is loaded
  if (isImageLoaded) {
    return (
      <ImageCropperCore
        key={selectedImageKey}
        originalImage={originalImage}
        frameWidth={frameWidth}
        frameHeight={frameHeight}
        zoomStep={zoomStep}
        maxScale={maxScale}
      />
    )
  }

  // Fallback state (shouldn't normally reach here)
  return (
    <div className="image-cropper no-image">
      <p>Preparing image...</p>
    </div>
  )
}

export default ImageCropper