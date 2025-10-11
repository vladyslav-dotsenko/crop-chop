import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../../store'
import type { Frame } from '../../types'
import { setAvailableFrames, selectFrame, openCustomFrameBuilder, closeCustomFrameBuilder } from '../../store/slices'
import FramePreview from '../FramePreview'
import CustomFrameBuilder from '../CustomFrameBuilder'
import frameConfig from '../../config/frames'
import './FrameSelector.css'

const FrameSelector: React.FC = () => {
  const dispatch = useDispatch()
  const { availableFrames, customFrames, selectedFrame, isCustomFrameBuilderOpen } = useSelector((state: RootState) => state.frameSelector)

  // Load frame configurations on component mount
  useEffect(() => {
    dispatch(setAvailableFrames(frameConfig.frames))
  }, [dispatch])

  const handleFrameSelect = (frame: Frame) => {
    dispatch(selectFrame(frame))
  }

  const handleCreateCustomFrame = () => {
    dispatch(openCustomFrameBuilder())
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


      {isCustomFrameBuilderOpen && (
        <div className="custom-frame-builder-overlay">
          <div className="custom-frame-builder-modal">
            <div className="modal-header">
              <h2>Create Custom Frame</h2>
              <button 
                className="modal-close"
                onClick={() => dispatch(closeCustomFrameBuilder())}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <CustomFrameBuilder />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FrameSelector
