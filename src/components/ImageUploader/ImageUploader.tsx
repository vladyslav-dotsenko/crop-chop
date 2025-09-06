import React, { useRef } from 'react'
import { useDispatch } from 'react-redux'
import { setOriginalImage } from '../../store/slices'

const ImageUploader: React.FC = () => {
  const dispatch = useDispatch()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        // Extract filename without extension
        const filename = file.name.replace(/\.[^/.]+$/, '')
        dispatch(setOriginalImage({ imageUrl: result, filename }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="image-uploader">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      <button
        onClick={handleClick}
        className="upload-button"
      >
        Choose Image
      </button>
    </div>
  )
}

export default ImageUploader
