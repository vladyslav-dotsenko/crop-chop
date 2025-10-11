import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../../store'
import type { Frame, FrameParameter } from '../../types'
import { updateFrameParameter } from '../../store/slices'
import './FrameParameters.css'

interface FrameParametersProps {
  frame: Frame | null
}

const FrameParameters: React.FC<FrameParametersProps> = ({ frame }) => {
  const dispatch = useDispatch()
  const { frameParameters } = useSelector((state: RootState) => state.framesComposer)

  if (!frame || !frame.parameters || frame.parameters.length === 0) {
    return (
      <div className="frame-parameters">
        <h3>Frame Parameters</h3>
        <div className="empty-state">
          <p>No parameters available for this frame</p>
        </div>
      </div>
    )
  }

  const currentParameters = frameParameters[frame.id] || {}
  
  const getParameterValue = (parameterId: string) => {
    const value = currentParameters[parameterId]
    return value !== undefined ? value : frame.parameters?.find(p => p.id === parameterId)?.defaultValue
  }

  const handleParameterChange = (parameterId: string, value: any) => {
    dispatch(updateFrameParameter({ frameId: frame.id, parameterId, value: String(value) }))
  }

  const shouldShowParameter = (parameter: FrameParameter): boolean => {
    if (!parameter.condition) return true
    
    // Simple condition evaluation for now (can be enhanced later)
    if (parameter.condition.includes('===')) {
      const [paramId, expectedValue] = parameter.condition.split(' === ')
      const currentValue = getParameterValue(paramId.replace(/['"]/g, ''))
      return currentValue === expectedValue.replace(/['"]/g, '')
    }
    
    return true
  }

  const renderParameterInput = (parameter: FrameParameter) => {
    const value = getParameterValue(parameter.id)

    switch (parameter.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleParameterChange(parameter.id, e.target.value)}
            placeholder={parameter.label}
            className="parameter-input text-input"
          />
        )
      
      case 'number':
        return (
          <input
            type="number"
            value={value || parameter.defaultValue || 0}
            onChange={(e) => handleParameterChange(parameter.id, Number(e.target.value))}
            min={parameter.min}
            max={parameter.max}
            step={parameter.step}
            className="parameter-input number-input"
          />
        )
      
      case 'select':
        // Special handling for background color with visual buttons
        if (parameter.id === 'backgroundColor') {
          return (
            <div className="color-options">
              {parameter.options?.map((option) => {
                const isSelected = (value || parameter.defaultValue) === option.value
                let buttonStyle: React.CSSProperties = {}
                
                // Set button background based on option
                switch (option.value) {
                  case 'lightBlue':
                    buttonStyle.background = '#80D8D8'
                    break
                  case 'darkBlue':
                    buttonStyle.background = '#204080'
                    break
                  case 'yellowGold':
                    buttonStyle.background = '#F0D060'
                    break
                  case 'gradient':
                    buttonStyle.background = 'linear-gradient(to bottom, #E060E0, #8040C0)'
                    break
                  case 'custom':
                    buttonStyle.background = 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)'
                    buttonStyle.backgroundSize = '8px 8px'
                    buttonStyle.backgroundPosition = '0 0, 0 4px, 4px -4px, -4px 0px'
                    break
                }
                
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`color-option ${isSelected ? 'selected' : ''}`}
                    style={buttonStyle}
                    onClick={() => handleParameterChange(parameter.id, option.value)}
                    title={option.label}
                  >
                    {option.value === 'custom' && (
                      <span className="custom-label">Custom</span>
                    )}
                  </button>
                )
              })}
            </div>
          )
        }
        
        // Default select dropdown for other select parameters
        return (
          <select
            value={value || parameter.defaultValue || ''}
            onChange={(e) => handleParameterChange(parameter.id, e.target.value)}
            className="parameter-input select-input"
          >
            {parameter.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )
      
      case 'color':
        return (
          <input
            type="color"
            value={value || parameter.defaultValue || '#000000'}
            onChange={(e) => handleParameterChange(parameter.id, e.target.value)}
            className="parameter-input color-input"
          />
        )
      
      case 'boolean':
        return (
          <input
            type="checkbox"
            checked={value || parameter.defaultValue || false}
            onChange={(e) => handleParameterChange(parameter.id, e.target.checked)}
            className="parameter-input checkbox-input"
          />
        )
      
      default:
        return null
    }
  }

  return (
    <div className="frame-parameters">
      <h3>Frame Parameters ({frame.parameters.length} params)</h3>
      <div className="parameters-list">
        {frame.parameters.map((parameter) => {
          if (!shouldShowParameter(parameter)) return null
          
          return (
            <div key={parameter.id} className="parameter-item">
              <label htmlFor={`param-${parameter.id}`} className="parameter-label">
                {parameter.label}
              </label>
              <div className="parameter-input-container">
                {renderParameterInput(parameter)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default FrameParameters

