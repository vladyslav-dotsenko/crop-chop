import { Provider, useSelector } from 'react-redux'
import { store } from './store'
import type { RootState } from './store'
import { FrameSelector, Navigation, PreviewPanel, ImageSidebar, TabbedInterface } from './components'
import './App.css'

function AppContent() {
  const { isFrameSelectorOpen, selectedFrame } = useSelector((state: RootState) => state.frameSelector)

  // Show frame selector if explicitly open or no frame is selected yet
  const showFrameSelector = isFrameSelectorOpen || !selectedFrame

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-text">
            <h1>CropChop</h1>
            <p>Image cropping tool</p>
          </div>
          <a 
            href="https://github.com/vladyslav-dotsenko/crop-chop" 
            target="_blank" 
            rel="noopener noreferrer"
            className="github-link"
            title="View source on GitHub"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
        </div>
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
              <TabbedInterface />
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
