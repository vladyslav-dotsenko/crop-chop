import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { addCustomFrame, selectFrame, closeCustomFrameModal } from '../../store/slices'
import type { Frame } from '../../types'
import './CustomFrameModal.css'

interface CustomFrameModalProps {
  isOpen: boolean
}

const CustomFrameModal: React.FC<CustomFrameModalProps> = ({ isOpen }) => {
  const dispatch = useDispatch()
  const [width, setWidth] = useState<number>(800)
  const [height, setHeight] = useState<number>(600)
  const [title, setTitle] = useState<string>('')
  const [description, setDescription] = useState<string>('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (width <= 0 || height <= 0) {
      alert('Width and height must be greater than 0')
      return
    }

    const customFrame: Frame = {
      id: `custom-${Date.now()}`,
      title: title.trim() || `Custom ${width}×${height}`,
      width,
      height,
      description: description.trim() || `Custom frame ${width}×${height} pixels`,
      isCustom: true
    }

    dispatch(addCustomFrame(customFrame))
    dispatch(selectFrame(customFrame))
    dispatch(closeCustomFrameModal())
    
    // Reset form
    setWidth(800)
    setHeight(600)
    setTitle('')
    setDescription('')
  }

  const handleCancel = () => {
    dispatch(closeCustomFrameModal())
    // Reset form
    setWidth(800)
    setHeight(600)
    setTitle('')
    setDescription('')
  }

  if (!isOpen) return null

  const aspectRatio = width && height ? (width / height).toFixed(2) : '0'

  return (
    <div className="custom-frame-modal-overlay">
      <div className="custom-frame-modal">
        <div className="custom-frame-modal-header">
          <h2>Create Custom Frame</h2>
          <button 
            className="close-button"
            onClick={handleCancel}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="custom-frame-form">
          <div className="form-group">
            <label htmlFor="width">Width (px)</label>
            <input
              id="width"
              type="number"
              value={width}
              onChange={(e) => setWidth(parseInt(e.target.value) || 0)}
              min="1"
              max="10000"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="height">Height (px)</label>
            <input
              id="height"
              type="number"
              value={height}
              onChange={(e) => setHeight(parseInt(e.target.value) || 0)}
              min="1"
              max="10000"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="title">Title (optional)</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`Custom ${width}×${height}`}
              maxLength={50}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`Custom frame ${width}×${height} pixels`}
              maxLength={100}
              rows={2}
            />
          </div>

          <div className="frame-preview-section">
            <h3>Preview</h3>
            <div className="frame-preview-container">
              <div 
                className="frame-preview-box"
                style={{
                  width: Math.min(120, (width / height) * 120),
                  height: Math.min(120, (height / width) * 120)
                }}
              >
                <div className="frame-preview-content">
                  <span className="frame-dimensions">
                    {width} × {height}
                  </span>
                  <span className="frame-ratio">
                    {aspectRatio}:1
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleCancel} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="create-button">
              Create Frame
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CustomFrameModal
