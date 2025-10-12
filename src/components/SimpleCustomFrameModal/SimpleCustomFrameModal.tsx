import React, { useState } from 'react'
import './SimpleCustomFrameModal.css'

interface SimpleCustomFrameModalProps {
  isOpen: boolean
  onClose: () => void
  onAddFrame: (frame: { width: number; height: number }) => void
}

const SimpleCustomFrameModal: React.FC<SimpleCustomFrameModalProps> = ({
  isOpen,
  onClose,
  onAddFrame
}) => {
  const [width, setWidth] = useState<number>(400)
  const [height, setHeight] = useState<number>(400)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (width > 0 && height > 0) {
      onAddFrame({ width, height })
      onClose()
    }
  }

  const handleClose = () => {
    setWidth(400)
    setHeight(400)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="simple-custom-modal-overlay">
      <div className="simple-custom-modal">
        <div className="simple-custom-modal-header">
          <h3>Add Custom Simple Frame</h3>
          <button 
            className="close-button" 
            onClick={handleClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="simple-custom-modal-form">
          <div className="form-group">
            <label htmlFor="width">Width (px)</label>
            <input
              id="width"
              type="number"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              min="100"
              max="4000"
              required
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="height">Height (px)</label>
            <input
              id="height"
              type="number"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              min="100"
              max="4000"
              required
              className="form-input"
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              onClick={handleClose}
              className="cancel-button"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="add-button"
              disabled={width <= 0 || height <= 0}
            >
              Add Frame
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SimpleCustomFrameModal
