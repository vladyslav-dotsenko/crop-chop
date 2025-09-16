import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../../store'
import { openFrameSelector, resetAllImages } from '../../store/slices'

import './Navigation.css'

const Navigation: React.FC = () => {
  const dispatch = useDispatch()
  const { isFrameSelectorOpen, selectedFrame } = useSelector((state: RootState) => state.frameSelector)

  const handleBackToFrameSelector = () => {
    dispatch(resetAllImages())
    dispatch(openFrameSelector())
  }

  // Show back button when we have a selected frame and frame selector is closed
  if (!selectedFrame || isFrameSelectorOpen) {
    return null
  }

  return (
    <div className="navigation">
      <button
        onClick={handleBackToFrameSelector}
        className="back-button"
        title="Select a frame"
      >
← BACK TO FRAME SELECTION
      </button>
    </div>
  )
}

export default Navigation
