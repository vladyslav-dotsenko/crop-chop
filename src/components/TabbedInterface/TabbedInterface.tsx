import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../../store'
import ImageCropper from '../ImageCropper'
import FrameParameters from '../FrameParameters'
import SaveConfigModal from '../SaveConfigModal'
import { setSaveModalOpen } from '../../store/slices'
import { FaSave } from 'react-icons/fa'
import './TabbedInterface.css'

const TabbedInterface: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cropping' | 'parameters'>('cropping')
  const dispatch = useDispatch()
  const { selectedFrame } = useSelector((state: RootState) => state.frameSelector)
  const { selectedImageKey } = useSelector((state: RootState) => state.imageCropper)

  return (
    <div className="tabbed-interface">
      <div className="tab-header">
        <button
          className={`tab-button ${activeTab === 'cropping' ? 'active' : ''}`}
          onClick={() => setActiveTab('cropping')}
        >
          Image Cropping
        </button>
        <button
          className={`tab-button ${activeTab === 'parameters' ? 'active' : ''}`}
          onClick={() => setActiveTab('parameters')}
        >
          Frame Parameters
        </button>
      </div>
      
      <div className="tab-content">
        {activeTab === 'cropping' && (
          <div className="cropping-tab">
            <div className="cropper-section">
              <ImageCropper />
              <button
                className="floating-save-button"
                title="Save"
                onClick={() => dispatch(setSaveModalOpen(true))}
                disabled={!selectedImageKey}
              >
                <FaSave />
              </button>
            </div>
            <SaveConfigModal />
          </div>
        )}
        
        {activeTab === 'parameters' && (
          <div className="parameters-tab">
            {selectedFrame ? (
              <FrameParameters frame={selectedFrame} />
            ) : (
              <div className="no-frame-message">
                <p>Please select a frame first</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default TabbedInterface
