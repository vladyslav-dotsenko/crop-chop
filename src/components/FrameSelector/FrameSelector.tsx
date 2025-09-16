import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../../store'
import type { Frame } from '../../types'
import { setAvailableFrames, selectFrame } from '../../store/slices'
import FramePreview from '../FramePreview'
import frameConfig from '../../config/frames.json'
import './FrameSelector.css'

const FrameSelector: React.FC = () => {
  const dispatch = useDispatch()
  const { availableFrames, selectedFrame } = useSelector((state: RootState) => state.frameSelector)

  // Load frame configurations on component mount
  useEffect(() => {
    dispatch(setAvailableFrames(frameConfig.frames))
  }, [dispatch])

  const handleFrameSelect = (frame: Frame) => {
    dispatch(selectFrame(frame))
  }


  return (
    <div className="frame-selector">
      <div className="frame-selector-header">
        <h2>Choose Frame Size</h2>
        <p>Select a frame size for your image crop</p>
      </div>

      <div className="frames-grid">
        {availableFrames.map((frame) => (
          <FramePreview
            key={frame.id}
            frame={frame}
            isSelected={selectedFrame?.id === frame.id}
            onClick={() => handleFrameSelect(frame)}
          />
        ))}
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

    </div>
  )
}

export default FrameSelector
