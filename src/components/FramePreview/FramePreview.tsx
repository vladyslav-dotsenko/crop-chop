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

  const getFramePreviewSize = (width: number, height: number, maxSize: number = 120): { width: number; height: number } => {
    const aspectRatio = width / height
    if (width > height) {
      return {
        width: maxSize,
        height: maxSize / aspectRatio
      }
    } else {
      return {
        width: maxSize * aspectRatio,
        height: maxSize
      }
    }
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

  const previewSize = getFramePreviewSize(frame.width, frame.height)
  const aspectRatio = getAspectRatio(frame.width, frame.height)
  const croppedDimensions = getCroppedImageDimensions()
  const croppedAspectRatio = getAspectRatio(croppedDimensions.width, croppedDimensions.height)
  console.log({ croppedDimensions, frame })
  return (
    <div
      className={`frame-option ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="frame-preview">
        <div
          className="frame-preview-box"
          style={{
            width: previewSize.width,
            height: previewSize.height
          }}
        >
          {/* Cropped area overlay */}
          {croppedDimensions.width !== frame.width || croppedDimensions.height !== frame.height ? (
            <div
              className="cropped-area-overlay"
              style={{
                width: `${(croppedDimensions.width / frame.width) * 100}%`,
                height: `${(croppedDimensions.height / frame.height) * 100}%`,
                left: `${(croppedDimensions.x / frame.width) * 100}%`,
                top: `${(croppedDimensions.y / frame.height) * 100}%`
              }}
            />
          ) : null}
          
          <div className="frame-preview-content">
            <span className="frame-dimensions">
              {croppedDimensions.width} × {croppedDimensions.height}
            </span>
            <span className="frame-ratio">
              {croppedAspectRatio}
            </span>
          </div>
        </div>
      </div>
      
      <div className="frame-info">
        <h3 className="frame-title">
          {frame.title}
          {frame.isCustom && <span className="custom-badge">Custom</span>}
        </h3>
        <p className="frame-description">{frame.description}</p>
        <div className="frame-specs">
          <div className="size-info">
            <span className="frame-size">Art Area: {croppedDimensions.width} × {croppedDimensions.height}px</span>
            <span className="frame-ratio-text">({croppedAspectRatio})</span>
          </div>
          {croppedDimensions.width !== frame.width || croppedDimensions.height !== frame.height || croppedDimensions.x !== 0 || croppedDimensions.y !== 0 ? (
            <div className="cropped-size-info">
              <span className="cropped-size">Frame: {frame.width} × {frame.height}px</span>
              <span className="cropped-ratio-text">({aspectRatio})</span>
            </div>
          ) : (
            <div className="cropped-size-info">
              <span className="cropped-size">Full frame</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FramePreview
