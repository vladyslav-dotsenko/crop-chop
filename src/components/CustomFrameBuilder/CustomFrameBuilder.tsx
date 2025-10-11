import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../../store'
import type { Frame } from '../../types'
import { setCustomFrameJson, addCustomFrame } from '../../store/slices'
import './CustomFrameBuilder.css'

const CustomFrameBuilder: React.FC = () => {
  const dispatch = useDispatch()
  const { customFrameJson } = useSelector((state: RootState) => state.framesComposer)
  const [error, setError] = useState<string>('')
  const [previewFrame, setPreviewFrame] = useState<Frame | null>(null)

  const defaultFrameTemplate = {
    id: 'custom-frame',
    title: 'Custom Frame',
    width: 300,
    height: 200,
    description: 'User-defined custom frame',
    isCustom: true,
    parameters: [
      {
        id: 'title',
        name: 'title',
        type: 'text' as const,
        label: 'Card Title',
        defaultValue: 'Custom Card'
      },
      {
        id: 'rarity',
        name: 'rarity',
        type: 'select' as const,
        label: 'Rarity',
        defaultValue: 'common',
        options: ['common', 'uncommon', 'rare', 'mythic']
      },
      {
        id: 'manaCost',
        name: 'manaCost',
        type: 'text' as const,
        label: 'Mana Cost',
        defaultValue: '{1}{R}'
      }
    ],
    layers: [
      {
        id: 'background',
        type: 'background' as const,
        name: 'Background',
        visible: true,
        zIndex: 0,
        properties: {
          backgroundColor: '#1a1a1a',
          borderRadius: 8
        }
      },
      {
        id: 'border',
        type: 'border' as const,
        name: 'Border',
        visible: true,
        zIndex: 1,
        properties: {
          borderColor: '#00ff00',
          borderWidth: 2,
          borderRadius: 8
        }
      },
      {
        id: 'title-text',
        type: 'text' as const,
        name: 'Title Text',
        visible: true,
        zIndex: 2,
        properties: {
          x: 20,
          y: 20,
          color: '#ffffff',
          fontSize: 18,
          fontFamily: 'Arial, sans-serif',
          fontWeight: 'bold',
          textAlign: 'left' as const,
          content: '{{title}}'
        }
      }
    ],
    exportSizes: [
      { name: 'original', width: 300, height: 200, scale: 1 },
      { name: 'large', width: 600, height: 400, scale: 2 },
      { name: 'thumbnail', width: 150, height: 100, scale: 0.5 }
    ]
  }

  const handleJsonChange = (value: string) => {
    dispatch(setCustomFrameJson(value))
    setError('')
    
    try {
      if (value.trim()) {
        const parsed = JSON.parse(value)
        setPreviewFrame(parsed)
      } else {
        setPreviewFrame(null)
      }
    } catch (err) {
      setError('Invalid JSON format')
      setPreviewFrame(null)
    }
  }

  const handleLoadTemplate = () => {
    const templateJson = JSON.stringify(defaultFrameTemplate, null, 2)
    handleJsonChange(templateJson)
  }

  const handleCreateFrame = () => {
    if (!previewFrame) return

    try {
      const frameToAdd: Frame = {
        ...previewFrame,
        id: `custom-${Date.now()}`,
        title: previewFrame.title || 'Custom Frame'
      }
      
      dispatch(addCustomFrame(frameToAdd))
      setError('')
      
      // Clear the JSON after successful creation
      dispatch(setCustomFrameJson(''))
      setPreviewFrame(null)
    } catch (err) {
      setError('Failed to create frame')
    }
  }

  return (
    <div className="custom-frame-builder">
      <h3>Custom Frame Builder</h3>
      
      <div className="builder-section">
        <div className="section-header">
          <h4>Frame JSON Configuration</h4>
          <button 
            className="template-btn"
            onClick={handleLoadTemplate}
            title="Load MTG-style template"
          >
            Load Template
          </button>
        </div>
        
        <textarea
          value={customFrameJson}
          onChange={(e) => handleJsonChange(e.target.value)}
          placeholder="Enter frame configuration JSON..."
          className="json-textarea"
          rows={15}
        />
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>

      {previewFrame && (
        <div className="builder-section">
          <h4>Preview</h4>
          <div className="frame-preview">
            <div className="preview-info">
              <p><strong>Title:</strong> {previewFrame.title}</p>
              <p><strong>Size:</strong> {previewFrame.width} × {previewFrame.height}px</p>
              <p><strong>Parameters:</strong> {previewFrame.parameters?.length || 0}</p>
              <p><strong>Layers:</strong> {previewFrame.layers?.length || 0}</p>
            </div>
            
            <div className="preview-actions">
              <button 
                className="create-frame-btn"
                onClick={handleCreateFrame}
              >
                Create Frame
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="builder-section">
        <h4>JSON Schema</h4>
        <div className="schema-info">
          <p>Frame configuration supports:</p>
          <ul>
            <li><strong>parameters:</strong> Configurable inputs (text, number, select, color, boolean)</li>
            <li><strong>layers:</strong> Visual elements (background, border, text, image, shape)</li>
            <li><strong>exportSizes:</strong> Predefined export dimensions</li>
            <li><strong>properties:</strong> Layer-specific styling and positioning</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default CustomFrameBuilder

