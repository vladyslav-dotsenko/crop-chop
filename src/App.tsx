import { Provider, useSelector } from 'react-redux'
import { store } from './store'
import type { RootState } from './store'
import { FrameSelector, ImageUploader, ImageCropper, Navigation, PreviewPanel, ImageSidebar } from './components'
import './App.css'

function AppContent() {
  const { isFrameSelectorOpen, selectedFrame } = useSelector((state: RootState) => state.frameSelector)

  // Show frame selector if explicitly open or no frame is selected yet
  const showFrameSelector = isFrameSelectorOpen || !selectedFrame

  return (
    <div className="app">
      <header className="app-header">
        <h1>CropChop</h1>
        <p>Image cropping tool</p>
      </header>
      
      {showFrameSelector ? (
        <div className="frame-selector-container">
          <FrameSelector />
        </div>
      ) : (
        <>
          <Navigation />
          <div className="app-content">
            <div className="left-sidebar">
              <ImageSidebar />
            </div>
            
            <div className="main-area">
              <div className="upload-section">
                <ImageUploader />
              </div>
              <div className="cropper-section">
                <ImageCropper />
              </div>
            </div>
            
            <div className="right-sidebar">
              <PreviewPanel
                frameWidth={selectedFrame?.width || 300}
                frameHeight={selectedFrame?.height || 200}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  )
}

export default App
