import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../../store'
import type { Frame } from '../../types'
import { setAvailableFrames, selectFrame, openCustomFrameModal } from '../../store/slices'
import FramePreview from '../FramePreview'
import CustomFrameModal from '../CustomFrameModal'
import frameConfig from '../../config/frames.json'
import './FrameSelector.css'

const FrameSelector: React.FC = () => {
  const dispatch = useDispatch()
  const { availableFrames, customFrames, selectedFrame, isCustomFrameModalOpen } = useSelector((state: RootState) => state.frameSelector)

  // Load frame configurations on component mount
  useEffect(() => {
    dispatch(setAvailableFrames(frameConfig.frames))
  }, [dispatch])

  const handleFrameSelect = (frame: Frame) => {
    dispatch(selectFrame(frame))
  }

  const handleCreateCustomFrame = () => {
    dispatch(openCustomFrameModal())
  }

  // Combine available frames and custom frames
  const allFrames = [...availableFrames, ...customFrames]


  return (
    <div className="frame-selector">
      <div className="frame-selector-header">
        <h2>Choose Frame Size</h2>
        <p>Select a frame size for your image crop</p>
      </div>

      <div className="frames-grid">
        {allFrames.map((frame) => (
          <FramePreview
            key={frame.id}
            frame={frame}
            isSelected={selectedFrame?.id === frame.id}
            onClick={() => handleFrameSelect(frame)}
          />
        ))}
        
        {/* Custom Frame Option */}
        <div className="custom-frame-option" onClick={handleCreateCustomFrame}>
          <div className="custom-frame-preview">
            <div className="custom-frame-icon">
              <span>+</span>
            </div>
          </div>
          <div className="frame-info">
            <h3 className="frame-title">Create Custom</h3>
            <p className="frame-description">Define your own frame size</p>
            <div className="frame-specs">
              <span className="frame-size">Custom dimensions</span>
            </div>
          </div>
        </div>
      </div>

      {selectedFrame && (
        <div className="frame-selection-actions">
          <button
            className="start-cropping-button"
            onClick={() => {
              // Frame is already selected, this will close the frame selector
              dispatch(selectFrame(selectedFrame))
            }}
          >
            START CROPPING
          </button>
        </div>
      )}

      <CustomFrameModal isOpen={isCustomFrameModalOpen} />
    </div>
  )
}

export default FrameSelector
