import { Provider } from 'react-redux'
import { store } from './store'
import ImageUploader from './components/ImageUploader'
import ImageCropper from './components/ImageCropper'
import PreviewPanel from './components/PreviewPanel'
import './App.css'

function App() {
  return (
    <Provider store={store}>
      <div className="app">
        <header className="app-header">
          <h1>CropChop</h1>
          <p>Image cropping tool</p>
        </header>
        
        <div className="app-content">
          <div className="main-area">
            <div className="upload-section">
              <ImageUploader />
            </div>
            <div className="cropper-section">
              <ImageCropper />
            </div>
          </div>
          
          <div className="sidebar">
            <PreviewPanel />
          </div>
        </div>
      </div>
    </Provider>
  )
}

export default App
