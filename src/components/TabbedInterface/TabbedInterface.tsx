import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../../store'
import ImageCropper from '../ImageCropper'
import FrameParameters from '../FrameParameters'
import './TabbedInterface.css'

const TabbedInterface: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cropping' | 'parameters'>('cropping')
  const { selectedFrame } = useSelector((state: RootState) => state.frameSelector)

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
            </div>
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
