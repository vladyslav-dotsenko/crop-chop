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

  const previewSize = getFramePreviewSize(frame.width, frame.height)
  const aspectRatio = getAspectRatio(frame.width, frame.height)

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
          <div className="frame-preview-content">
            <span className="frame-dimensions">
              {frame.width} × {frame.height}
            </span>
            <span className="frame-ratio">
              {aspectRatio}
            </span>
          </div>
        </div>
      </div>
      
      <div className="frame-info">
        <h3 className="frame-title">{frame.title}</h3>
        <p className="frame-description">{frame.description}</p>
        <div className="frame-specs">
          <span className="frame-size">{frame.width} × {frame.height}px</span>
          <span className="frame-ratio-text">{aspectRatio}</span>
        </div>
      </div>
    </div>
  )
}

export default FramePreview
