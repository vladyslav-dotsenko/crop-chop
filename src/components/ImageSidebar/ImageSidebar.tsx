import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../../store'
import { selectImage, removeImage } from '../../store/slices'
import './ImageSidebar.css'

const ImageSidebar: React.FC = () => {
  const dispatch = useDispatch()
  const { images, selectedImageKey } = useSelector((state: RootState) => state.imageCropper)

  const handleImageSelect = (imageKey: string) => {
    dispatch(selectImage(imageKey))
  }

  const handleRemoveImage = (imageKey: string, e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch(removeImage(imageKey))
  }

  const imageEntries = Object.entries(images)

  if (imageEntries.length === 0) {
    return (
      <div className="image-sidebar">
        <h3>Images</h3>
        <div className="empty-state">
          <p>No images uploaded</p>
        </div>
      </div>
    )
  }

  return (
    <div className="image-sidebar">
      <h3>Images ({imageEntries.length})</h3>
      <div className="image-list">
        {imageEntries.map(([imageKey, imageData]) => (
          <div
            key={imageKey}
            className={`image-item ${selectedImageKey === imageKey ? 'selected' : ''}`}
            onClick={() => handleImageSelect(imageKey)}
          >
            <div className="image-preview">
              <img
                src={imageData.originalImage}
                alt={imageData.filename}
                draggable={false}
              />
            </div>
            <div className="image-info">
              <span className="filename">{imageData.filename}</span>
              <button
                className="remove-btn"
                onClick={(e) => handleRemoveImage(imageKey, e)}
                title="Remove image"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ImageSidebar
