import React, { useRef, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../../store'
import { setFilename } from '../../store/slices'

const PreviewPanel: React.FC = () => {
  const dispatch = useDispatch()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const {
    originalImage,
    imagePosition,
    imageScale,
    filename,
  } = useSelector((state: RootState) => state.imageCropper)

  useEffect(() => {
    if (!originalImage || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return



    const img = new Image()
    img.onload = () => {
      // Set canvas size to crop frame size (centered frame)
      const frameWidth = 300
      const frameHeight = 200
      canvas.width = frameWidth
      canvas.height = frameHeight

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Get the cropper container dimensions
      const cropperContainer = document.querySelector('.image-cropper')
      if (!cropperContainer) return
      
      const containerRect = cropperContainer.getBoundingClientRect()
      const containerWidth = containerRect.width
      const containerHeight = containerRect.height
      
      // Calculate frame position (centered in container)
      const frameX = (containerWidth - frameWidth) / 2
      const frameY = (containerHeight - frameHeight) / 2
      
      // The image is centered at (containerWidth/2, containerHeight/2) + imagePosition
      // imagePosition is now the offset from the center
      const imageCenterX = containerWidth / 2 + imagePosition.x
      const imageCenterY = containerHeight / 2 + imagePosition.y
      
      // Image top-left corner in container coordinates
      const imageTopLeftX = imageCenterX - (img.width * imageScale) / 2
      const imageTopLeftY = imageCenterY - (img.height * imageScale) / 2
      
      // Calculate source coordinates in the original image
      const sourceX = (frameX - imageTopLeftX) / imageScale
      const sourceY = (frameY - imageTopLeftY) / imageScale
      const sourceWidth = frameWidth / imageScale
      const sourceHeight = frameHeight / imageScale

      // Draw the cropped portion (no clamping for now)
      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        frameWidth,
        frameHeight
      )
    }
    img.src = originalImage
  }, [originalImage, imagePosition, imageScale])

  const handleSave = useCallback(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const link = document.createElement('a')
    
    // Add frame size to filename (300x200)
    const frameSize = '300x200'
    const baseFilename = filename.endsWith('.png') ? filename.replace('.png', '') : filename
    const filenameWithSize = `${baseFilename}_${frameSize}.png`
    
    link.download = filenameWithSize
    link.href = canvas.toDataURL('image/png')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [filename])

  if (!originalImage) {
    return (
      <div className="preview-panel no-image">
        <h3>Preview</h3>
        <p>Upload an image to see the cropped preview</p>
      </div>
    )
  }

  return (
    <div className="preview-panel">
      <h3>Preview</h3>
      <div className="preview-container">
        <canvas
          ref={canvasRef}
          className="preview-canvas"
        />
      </div>
      <div className="preview-info">
        <p>Size: 300 × 200px</p>
        <p>Scale: {imageScale.toFixed(2)}x</p>
      </div>
      <div className="filename-input-container">
        <label htmlFor="filename-input" className="filename-label">
          Filename:
        </label>
        <input
          id="filename-input"
          type="text"
          value={filename}
          onChange={(e) => dispatch(setFilename(e.target.value))}
          className="filename-input"
          placeholder="Enter filename"
          disabled={!originalImage}
        />
      </div>
      <button 
        className="save-button"
        onClick={handleSave}
        disabled={!originalImage}
      >
        Save as PNG
      </button>
    </div>
  )
}

export default PreviewPanel
