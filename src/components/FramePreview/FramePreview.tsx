import React from 'react'
import type { Frame } from '../../types'
import './FramePreview.css'

interface FramePreviewProps {
  frame: Frame
  isSelected: boolean
  onClick: () => void
}

const FramePreview: React.FC<FramePreviewProps> = ({ frame, isSelected, onClick }) => {
  const getAspectRatio = (width: number, height: number): string => {
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
    const divisor = gcd(width, height)
    return `${width / divisor}:${height / divisor}`
  }

  // Get cropped image dimensions and position from art area layer
  const getCroppedImageDimensions = () => {
    if (frame.layers) {
      const artAreaLayer = frame.layers.find(layer => 
        layer.type === 'image' && layer.properties.imageUrl === '{{croppedImage}}'
      )
      
      if (artAreaLayer) {
        return {
          width: artAreaLayer.properties.width || frame.width,
          height: artAreaLayer.properties.height || frame.height,
          x: artAreaLayer.properties.x || 0,
          y: artAreaLayer.properties.y || 0
        }
      }
    }
    
    // Fallback to full frame dimensions
    return { width: frame.width, height: frame.height, x: 0, y: 0 }
  }

  const cropDimensions = getCroppedImageDimensions()
  const cropRatio = getAspectRatio(cropDimensions.width, cropDimensions.height)
  
  const hasCropArea = cropDimensions.width !== frame.width || 
                       cropDimensions.height !== frame.height || 
                       cropDimensions.x !== 0 || 
                       cropDimensions.y !== 0

  // Calculate schematic size to fit in container
  const getSchematicSize = () => {
    const maxWidth = 80
    const maxHeight = 64
    const aspectRatio = frame.width / frame.height
    
    if (aspectRatio > 1) {
      // Wider than tall
      const width = maxWidth
      const height = Math.min(maxHeight, width / aspectRatio)
      return { width, height }
    } else {
      // Taller than wide
      const height = maxHeight
      const width = Math.min(maxWidth, height * aspectRatio)
      return { width, height }
    }
  }

  const schematic = getSchematicSize()

  return (
    <div
      className={`frame-row ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      {/* Visual Preview Section */}
      <div className="row-preview">
        <div
          className="preview-schematic"
          style={{
            width: schematic.width,
            height: schematic.height
          }}
        >
          {hasCropArea && (
            <div
              className="preview-crop"
              style={{
                width: `${(cropDimensions.width / frame.width) * 100}%`,
                height: `${(cropDimensions.height / frame.height) * 100}%`,
                left: `${(cropDimensions.x / frame.width) * 100}%`,
                top: `${(cropDimensions.y / frame.height) * 100}%`
              }}
            />
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="row-info">
        <div className="info-header">
          <span className="info-title">{frame.title}</span>
          <div className="info-badges">
            {frame.type === 'fancy' && <span className="badge fancy">layers</span>}
            {frame.isCustom && <span className="badge custom">custom</span>}
          </div>
        </div>

        <div className="info-body">
          <div className="info-specs">
            <div className="spec-item primary">
              <span className="spec-label">crop:</span>
              <span className="spec-value">{cropDimensions.width}×{cropDimensions.height}</span>
              <span className="spec-ratio">({cropRatio})</span>
            </div>
            
            {hasCropArea && (
              <div className="spec-item secondary">
                <span className="spec-label">frame:</span>
                <span className="spec-value">{frame.width}×{frame.height}</span>
              </div>
            )}

            {frame.parameters && frame.parameters.length > 0 && (
              <div className="spec-item tertiary">
                <span className="spec-icon">⚙</span>
                <span className="spec-value">{frame.parameters.length} params</span>
              </div>
            )}
          </div>

          <div className="info-description">{frame.description}</div>
        </div>
      </div>
    </div>
  )
}

export default FramePreview
