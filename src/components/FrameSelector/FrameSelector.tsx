import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../../store'
import type { Frame } from '../../types'
import { setAvailableFrames, selectFrame, openCustomFrameBuilder, closeCustomFrameBuilder, addCustomFrame } from '../../store/slices'
import FramePreview from '../FramePreview'
import CustomFrameBuilder from '../CustomFrameBuilder'
import SimpleCustomFrameModal from '../SimpleCustomFrameModal'
import frameConfig from '../../config/frames'
import './FrameSelector.css'

const FrameSelector: React.FC = () => {
  const dispatch = useDispatch()
  const { availableFrames, customFrames, selectedFrame, isCustomFrameBuilderOpen } = useSelector((state: RootState) => state.frameSelector)
  const [isSimpleCustomModalOpen, setIsSimpleCustomModalOpen] = useState(false)

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

  const handleCreateSimpleCustomFrame = () => {
    setIsSimpleCustomModalOpen(true)
  }

  const handleAddSimpleFrame = ({ width, height }: { width: number; height: number }) => {
    const customFrame: Frame = {
      id: `custom-simple-${Date.now()}`,
      title: `Custom ${width}×${height}`,
      width,
      height,
      description: `Custom simple frame ${width}×${height}px`,
      type: 'simple',
      isCustom: true,
      exportSizes: [
        { name: 'original', width, height, scale: 1 },
        { name: 'large', width: width * 2, height: height * 2, scale: 2 },
        { name: 'thumbnail', width: width * 0.5, height: height * 0.5, scale: 0.5 }
      ]
    }
    dispatch(addCustomFrame(customFrame))
  }

  // Combine available frames and custom frames
  const allFrames = [...availableFrames, ...customFrames]
  
  // Separate frames by type
  const simpleFrames = allFrames.filter(frame => frame.type === 'simple' || !frame.type)
  const fancyFrames = allFrames.filter(frame => frame.type === 'fancy')

  return (
    <div className="frame-selector">
      <div className="selector-header">
        <h2>Frame Selector</h2>
        <p>Choose a frame or create a custom one</p>
      </div>

      <div className="selector-content">
        {/* All frames in one uniform grid */}
        <div className="frames-grid">
          {/* Simple Frames */}
          {simpleFrames.map((frame) => (
            <FramePreview
              key={frame.id}
              frame={frame}
              isSelected={selectedFrame?.id === frame.id}
              onClick={() => handleFrameSelect(frame)}
            />
          ))}

          {/* Fancy Frames */}
          {fancyFrames.map((frame) => (
            <FramePreview
              key={frame.id}
              frame={frame}
              isSelected={selectedFrame?.id === frame.id}
              onClick={() => handleFrameSelect(frame)}
            />
          ))}

          {/* Custom Simple Frame Action */}
          <div 
            className="create-cell simple"
            onClick={handleCreateSimpleCustomFrame}
          >
            <div className="cell-icon">+</div>
            <div className="cell-content">
              <div className="cell-label">Simple Crop</div>
              <div className="cell-desc">Custom dimensions</div>
            </div>
          </div>

          {/* Custom Advanced Frame Action */}
          <div 
            className="create-cell advanced"
            onClick={handleCreateCustomFrame}
          >
            <div className="cell-icon">++</div>
            <div className="cell-content">
              <div className="cell-label">Advanced</div>
              <div className="cell-desc">Layers & parameters</div>
            </div>
          </div>
        </div>
      </div>

      {isCustomFrameBuilderOpen && (
        <div className="custom-frame-builder-overlay">
          <div className="custom-frame-builder-modal">
            <div className="modal-header">
              <h2>Create Custom Fancy Frame</h2>
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

      <SimpleCustomFrameModal
        isOpen={isSimpleCustomModalOpen}
        onClose={() => setIsSimpleCustomModalOpen(false)}
        onAddFrame={handleAddSimpleFrame}
      />
    </div>
  )
}

export default FrameSelector
