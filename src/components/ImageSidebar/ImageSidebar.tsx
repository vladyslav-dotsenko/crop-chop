import React, { useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../../store'
import { selectImage, removeImage, addImage } from '../../store/slices'
import './ImageSidebar.css'

const ImageSidebar: React.FC = () => {
  const dispatch = useDispatch()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { images, selectedImageKey } = useSelector((state: RootState) => state.imageCropper)

  const handleImageSelect = (imageKey: string) => {
    dispatch(selectImage(imageKey))
  }

  const handleRemoveImage = (imageKey: string, e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch(removeImage(imageKey))
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          // Extract filename without extension
          const filename = file.name.replace(/\.[^/.]+$/, '')
          dispatch(addImage({ imageUrl: result, filename }))
        }
        reader.readAsDataURL(file)
      }
    })

    // Reset the input so the same files can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleChooseImagesClick = () => {
    fileInputRef.current?.click()
  }

  const imageEntries = Object.entries(images)

  return (
    <div className="image-sidebar">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      <div className="choose-images-section">
        <button
          onClick={handleChooseImagesClick}
          className="choose-images-button"
        >
          <div className="choose-images-icon">
            <span>+</span>
          </div>
          <div className="choose-images-text">
            <div className="choose-images-title">Add Images</div>
            <div className="choose-images-subtitle">Upload image files</div>
          </div>
        </button>
      </div>

      {imageEntries.length === 0 ? (
        <div className="empty-state">
          <p>No images uploaded</p>
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  )
}

export default ImageSidebar
