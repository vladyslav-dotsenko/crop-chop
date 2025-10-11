import React, { useRef } from 'react'
import { useDispatch } from 'react-redux'
import { addImage } from '../../store/slices'

const ImageUploader: React.FC = () => {
  const dispatch = useDispatch()
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="image-uploader">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      <button
        onClick={handleClick}
        className="upload-button"
      >
        Add Images
      </button>
    </div>
  )
}

export default ImageUploader
