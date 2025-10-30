import React, { useRef, useEffect, useCallback, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../../store'
import type { Frame } from '../../types'
import { updateImageFilename, toggleExportSize, setExportFormat, setExportCroppedOnly } from '../../store/slices'
import { convertFAClassesToUnicode, testFontAwesome, loadFontAwesomeForCanvas, tryAlternativeFontLoading, calculateAlignedPosition, getCanvasTextAlign, measureTextWidth, renderWrappedText, resolveBackgroundColor, createCanvasGradient, getCropAreaDimensions } from '../../utils'
import './PreviewPanel.css'

interface PreviewPanelProps {
  frameWidth: number
  frameHeight: number
}

const interpolateAgainst = (state: Record<string, string>) => (_: string, p1: string) => state[p1]
const interpolateValue = (value: string, state: Record<string, string>) =>
  value.replace(/{{(\w+)}}/g, interpolateAgainst(state))

const PreviewPanel: React.FC<PreviewPanelProps> = ({ frameWidth, frameHeight }) => {
  const dispatch = useDispatch()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loadedImages, setLoadedImages] = useState<Record<string, HTMLImageElement>>({})
  const {
    images,
    selectedImageKey,
  } = useSelector((state: RootState) => state.imageCropper)
  const { selectedFrame } = useSelector((state: RootState) => state.frameSelector)
  const { frameParameters, selectedExportSizes, exportFormat, exportCroppedOnly } = useSelector((state: RootState) => state.framesComposer)

  // Get the currently selected image data
  const selectedImage = selectedImageKey ? images[selectedImageKey] : null
  const originalImage = selectedImage?.originalImage || null
  const imagePosition = selectedImage?.imagePosition || { x: 0, y: 0 }
  const imageScale = selectedImage?.imageScale || 1
  const filename = selectedImage?.filename ?? 'cropped-image'

  // Get crop area dimensions using the new configuration approach
  const cropDimensions = getCropAreaDimensions(selectedFrame, frameWidth, frameHeight)

  // Load Font Awesome for canvas rendering on component mount
  useEffect(() => {
    const initializeFontAwesome = async () => {
      let fontLoaded = await loadFontAwesomeForCanvas()
      if (!fontLoaded) {
        console.log('Trying alternative font loading...')
        fontLoaded = await tryAlternativeFontLoading()
      }
      await testFontAwesome()
    }
    initializeFontAwesome()
  }, [])

  // Pre-load static images when frame changes
  useEffect(() => {
    if (!selectedFrame || !selectedFrame.layers) return

    const imagesToLoad: { url: string; key: string }[] = []
    
    selectedFrame.layers.forEach(layer => {
      if (layer.type === 'image' && layer.properties.imageUrl && layer.properties.imageUrl !== '{{croppedImage}}') {
        let imageUrl = layer.properties.imageUrl
        // Use default parameter values for image loading
        // (Note: if you need dynamic image URLs based on parameters, handle that separately)
        if (selectedFrame.parameters) {
          selectedFrame.parameters.forEach(param => {
            imageUrl = imageUrl.replace(`{{${param.id}}}`, String(param.defaultValue ?? ''))
          })
        }
        imagesToLoad.push({ url: imageUrl, key: layer.id })
      }
    })

    // Load all images
    const loadPromises = imagesToLoad.map(({ url, key }) => {
      return new Promise<{ key: string; img: HTMLImageElement }>((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => resolve({ key, img })
        img.onerror = reject
        img.src = url
      })
    })

    Promise.all(loadPromises)
      .then(results => {
        const newLoadedImages: Record<string, HTMLImageElement> = {}
        results.forEach(({ key, img }) => {
          newLoadedImages[key] = img
        })
        setLoadedImages(newLoadedImages)
      })
      .catch(err => {
        console.error('Error loading frame images:', err)
      })
  }, [selectedFrame])

  // Helper function to render frame layers
  const renderFrameLayers = useCallback(async (ctx: CanvasRenderingContext2D, frame: Frame, width: number, height: number, croppedImage?: HTMLImageElement, sourceX?: number, sourceY?: number, sourceWidth?: number, sourceHeight?: number) => {
    // Ensure Font Awesome is loaded before rendering
    await loadFontAwesomeForCanvas()
    
    const frameDimensions = { width, height }
    
    // Helper function to get parameter value
    const getParameterValue = (frame: Frame, parameterId: string) => {
      if (!frame.parameters) return ''
      const param = frame.parameters.find(p => p.id === parameterId)
      if (!param) return ''
      
      const frameParams = frameParameters[frame.id] || {}
      const paramValue = frameParams[parameterId]
      return paramValue !== undefined ? paramValue : param.defaultValue
    }
    if (!frame.layers) return

    // Sort layers by zIndex
    const sortedLayers = [...frame.layers].sort((a, b) => a.zIndex - b.zIndex)

    sortedLayers.forEach(layer => {
      if (!layer.visible) return

      const props = layer.properties
      
      switch (layer.type) {
        case 'background':
          if (props.backgroundColor) {
            const state: Record<string, string> = frameParameters[frame.id] || {}
            const backgroundColorOption = interpolateValue(props.backgroundColor, state)
            const customBackgroundColor = props.customBackgroundColor ? interpolateValue(props.customBackgroundColor, state) : undefined
            
            // Resolve the actual color or gradient
            const resolvedColor = resolveBackgroundColor(backgroundColorOption, customBackgroundColor)
            
            // Set fill style based on resolved color
            if (typeof resolvedColor === 'string') {
              ctx.fillStyle = resolvedColor
            } else if (resolvedColor.type === 'gradient') {
              const gradient = createCanvasGradient(ctx, resolvedColor, props.width || width, props.height || height)
              ctx.fillStyle = gradient
            }
            
            if (props.borderRadius) {
              // Draw rounded rectangle
              ctx.beginPath()
              ctx.roundRect(props.x || 0, props.y || 0, props.width || width, props.height || height, props.borderRadius)
              ctx.fill()
            } else {
              ctx.fillRect(props.x || 0, props.y || 0, props.width || width, props.height || height)
            }
          }
          break
          
        case 'border':
          if (props.borderColor && props.borderWidth) {
            // Replace parameter placeholders in border color
            let borderColor = props.borderColor
            if (frame.parameters) {
              frame.parameters.forEach(param => {
                const value = getParameterValue(frame, param.id)
                borderColor = borderColor.replace(`{{${param.id}}}`, String(value))
              })
            }
            
            ctx.strokeStyle = borderColor
            ctx.lineWidth = props.borderWidth
            if (props.borderRadius) {
              // Draw rounded rectangle border
              ctx.beginPath()
              ctx.roundRect(props.x || 0, props.y || 0, props.width || width, props.height || height, props.borderRadius)
              ctx.stroke()
            } else {
              ctx.strokeRect(props.x || 0, props.y || 0, props.width || width, props.height || height)
            }
          }
          break
          
        case 'text':
          if (props.content) {
            // Replace parameter placeholders
            let content = props.content
            if (frame.parameters) {
              frame.parameters.forEach(param => {
                const value = getParameterValue(frame, param.id)
                content = content.replace(`{{${param.id}}}`, String(value))
              })
            }
            
            // Handle Font Awesome icons - try multiple approaches
            if (props.fontFamily && props.fontFamily.includes('Font Awesome')) {
              content = convertFAClassesToUnicode(content)
              console.log('FA content:', content, 'Original:', props.content)
              
              // Try different font combinations
              const fontCombinations = [
                '900 28px "Font Awesome 6 Free"',
                '900 28px "FontAwesome"',
                '900 28px "Font Awesome 6 Pro"',
                'normal 28px "Font Awesome 6 Free"',
                'normal 28px "FontAwesome"'
              ]
              
              let fontWorked = false
              for (const fontSpec of fontCombinations) {
                ctx.font = fontSpec
                const testChar = content.charAt(0)
                const metrics = ctx.measureText(testChar)
                
                console.log(`Testing font: ${fontSpec}, width: ${metrics.width}`)
                
                // If width is significantly different from 0, font might be working
                if (metrics.width > 2) {
                  console.log(`Font appears to work: ${fontSpec}`)
                  fontWorked = true
                  break
                }
              }
              
              if (!fontWorked) {
                console.warn('No Font Awesome font worked, trying emoji fallback')
                // Try emoji fallback for common icons
                const emojiMap: Record<string, string> = {
                  'github': '🐙',
                  'twitter': '🐦', 
                  'linkedin': '💼',
                  'facebook': '📘',
                  'instagram': '📷',
                  'youtube': '📺'
                }
                
                const iconNames = (props.content || '').split(/\s+/).filter(Boolean)
                let emojiContent = ''
                iconNames.forEach(iconName => {
                  const cleanName = iconName.replace('fa-', '').toLowerCase()
                  emojiContent += (emojiMap[cleanName] || '●') + ' '
                })
                content = emojiContent.trim()
                ctx.font = `${props.fontWeight || 'normal'} ${props.fontSize || 16}px Arial, sans-serif`
                console.log('Using emoji fallback:', content)
              }
            }
            
            ctx.fillStyle = props.color || '#ffffff'
            // Ensure Font Awesome font is properly loaded
            const fontFamily = props.fontFamily || 'Arial'
            const fontWeight = props.fontWeight || 'normal'
            const fontSize = props.fontSize || 16
            
            // Try multiple font fallbacks for Font Awesome
            if (fontFamily.includes('Font Awesome')) {
              ctx.font = `${fontWeight} ${fontSize}px "Font Awesome 6 Free", "Font Awesome 6 Pro", "FontAwesome", Arial, sans-serif`
            } else {
              ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
            }
            
            // Calculate aligned position
            const textWidth = measureTextWidth(ctx, content, fontSize, fontFamily, fontWeight)
            const textHeight = fontSize
            
            console.log('Icon alignment debug:', {
              content,
              textWidth,
              fontSize,
              fontFamily,
              fontWeight,
              alignX: props.alignX,
              marginX: props.marginX,
              frameWidth: frameDimensions.width
            })
            
            const alignedPos = calculateAlignedPosition(
              {
                alignX: props.alignX,
                alignY: props.alignY,
                marginX: props.marginX,
                marginY: props.marginY,
                x: props.x,
                y: props.y,
                width: props.width,
                height: props.height
              },
              frameDimensions,
              textWidth,
              textHeight
            )
            
            console.log('Calculated position:', alignedPos)
            
            // Set text alignment based on layer alignment
            ctx.textAlign = getCanvasTextAlign(props.textAlign, props.alignX)
            
            let x = alignedPos.x
            const y = alignedPos.y + fontSize
            
            // Adjust x position based on text alignment
            if (ctx.textAlign === 'right') {
              // For right-aligned text, x should be the right edge position
              x = frameDimensions.width - (props.marginX || 0)
            } else if (ctx.textAlign === 'center') {
              // For center-aligned text, x should be the center position
              x = frameDimensions.width / 2
            }
            
            console.log('Final rendering position:', { x, y, textAlign: ctx.textAlign })
            
            // Check if maxWidth is specified for text wrapping
            if (props.maxWidth && props.maxWidth > 0) {
              renderWrappedText(ctx, content, x, y, props.maxWidth, undefined, ctx.textAlign)
            } else {
              ctx.fillText(content, x, y)
            }
          }
          break
          
        case 'image':
          if (props.imageUrl === '{{croppedImage}}' && croppedImage && sourceX !== undefined && sourceY !== undefined && sourceWidth !== undefined && sourceHeight !== undefined) {
            // Render the cropped image in the specified art area
            const x = props.x || 0
            const y = props.y || 0
            const layerWidth = props.width || width
            const layerHeight = props.height || height
            
            if (props.borderRadius) {
              // Create a clipping path for rounded corners
              ctx.save()
              ctx.beginPath()
              ctx.roundRect(x, y, layerWidth, layerHeight, props.borderRadius)
              ctx.clip()
            }
            
            // For cropped image, use the layer's position and dimensions
            // The source coordinates are already calculated to show the correct cropped portion
            const finalDestX = x
            const finalDestY = y
            const finalDestW = layerWidth
            const finalDestH = layerHeight
            
            ctx.drawImage(
              croppedImage,
              sourceX,
              sourceY,
              sourceWidth,
              sourceHeight,
              finalDestX,
              finalDestY,
              finalDestW,
              finalDestH
            )
            
            if (props.borderRadius) {
              ctx.restore()
            }
          } else if (props.imageUrl && props.imageUrl !== '{{croppedImage}}') {
            // Render static images from pre-loaded images
            const img = loadedImages[layer.id]
            if (img) {
              // Calculate position using alignment system if alignment properties are present
              let x = props.x || 0
              let y = props.y || 0
              
              if (props.alignX !== undefined || props.alignY !== undefined) {
                const alignedPos = calculateAlignedPosition(
                  {
                    alignX: props.alignX,
                    alignY: props.alignY,
                    marginX: props.marginX,
                    marginY: props.marginY,
                    x: props.x,
                    y: props.y,
                    width: props.width,
                    height: props.height
                  },
                  frameDimensions,
                  props.width,
                  props.height
                )
                x = alignedPos.x
                y = alignedPos.y
              }
              
              const w = props.width || img.width
              const h = props.height || img.height

              if (props.opacity !== undefined) {
                ctx.save()
                ctx.globalAlpha = props.opacity
              }

              if (props.borderRadius) {
                ctx.save()
                ctx.beginPath()
                ctx.roundRect(x, y, w, h, props.borderRadius)
                ctx.clip()
              }

              ctx.drawImage(img, x, y, w, h)

              if (props.borderRadius) {
                ctx.restore()
              }
              if (props.opacity !== undefined) {
                ctx.restore()
              }
            }
          }
          break
      }
    })
  }, [frameParameters, loadedImages])

  useEffect(() => {
    if (!originalImage || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = async () => {
      // Set canvas size to frame dimensions
      canvas.width = frameWidth
      canvas.height = frameHeight

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // For preview, we want to show the cropped result
      // Use the calculated crop dimensions (same as ImageCropperCore)
      const cropWidth = cropDimensions.width
      const cropHeight = cropDimensions.height
      
      // Always center the crop area in the preview (matching the ImageCropperCore behavior)
      const cropX = (frameWidth - cropWidth) / 2
      const cropY = (frameHeight - cropHeight) / 2

      // Calculate the cropped portion of the image
      // The image is scaled and positioned, so we need to find what portion fits in the crop area
      const imageScaledWidth = img.width * imageScale
      const imageScaledHeight = img.height * imageScale
      
      // The image center is offset by imagePosition
      const imageCenterX = frameWidth / 2 + imagePosition.x
      const imageCenterY = frameHeight / 2 + imagePosition.y
      
      // Calculate the intersection between the crop area and the scaled image
      const imageLeft = imageCenterX - imageScaledWidth / 2
      const imageTop = imageCenterY - imageScaledHeight / 2
      const imageRight = imageCenterX + imageScaledWidth / 2
      const imageBottom = imageCenterY + imageScaledHeight / 2
      
      const cropLeft = cropX
      const cropTop = cropY
      const cropRight = cropX + cropWidth
      const cropBottom = cropY + cropHeight
      
      // Find the intersection area
      const intersectLeft = Math.max(imageLeft, cropLeft)
      const intersectTop = Math.max(imageTop, cropTop)
      const intersectRight = Math.min(imageRight, cropRight)
      const intersectBottom = Math.min(imageBottom, cropBottom)
      
      // Calculate source coordinates in the original image
      // Use the full crop area dimensions for the preview to ensure consistent sizing
      const sourceX = (cropLeft - imageLeft) / imageScale
      const sourceY = (cropTop - imageTop) / imageScale
      const sourceWidth = cropWidth / imageScale
      const sourceHeight = cropHeight / imageScale
      
      // Render all frame layers in order, including the cropped image
      if (selectedFrame && selectedFrame.layers) {
        // For frames with art area, let renderFrameLayers handle the positioning
        await renderFrameLayers(ctx, selectedFrame, frameWidth, frameHeight, img, sourceX, sourceY, sourceWidth, sourceHeight)
      } else {
        // Fallback: draw the cropped image without frame layers
        const destX = intersectLeft - cropLeft
        const destY = intersectTop - cropTop
        const destWidth = intersectRight - intersectLeft
        const destHeight = intersectBottom - intersectTop
        
        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          destX,
          destY,
          destWidth,
          destHeight
        )
      }
    }
    img.src = originalImage
  }, [originalImage, imagePosition, imageScale, frameWidth, frameHeight, selectedFrame, renderFrameLayers])

  const handleSave = useCallback(() => {
    if (!canvasRef.current || !selectedFrame || !originalImage) return
    if (!filename || filename.trim() === '') return

    const canvas = canvasRef.current
    
    // Export each selected size
    selectedExportSizes.forEach(sizeName => {
      let exportWidth = frameWidth
      let exportHeight = frameHeight
      let scaleSuffix = ''

      if (sizeName !== 'original' && selectedFrame.exportSizes) {
        const exportSize = selectedFrame.exportSizes.find(size => size.name === sizeName)
        if (exportSize) {
          exportWidth = exportSize.width
          exportHeight = exportSize.height
          scaleSuffix = `_${exportSize.name}`
        }
      }

      // Create a new canvas for the export size
      const exportCanvas = document.createElement('canvas')
      const exportCtx = exportCanvas.getContext('2d')
      if (!exportCtx) return

      if (exportCroppedOnly) {
        // Export only the cropped image area
        exportCanvas.width = cropDimensions.width
        exportCanvas.height = cropDimensions.height

        // Create a temporary image to get the cropped portion
        const tempImg = new Image()
        tempImg.onload = () => {
          // Calculate the same crop coordinates as used in preview
          const imageScaledWidth = tempImg.width * imageScale
          const imageScaledHeight = tempImg.height * imageScale
          
          const imageCenterX = frameWidth / 2 + imagePosition.x
          const imageCenterY = frameHeight / 2 + imagePosition.y
          
          const imageLeft = imageCenterX - imageScaledWidth / 2
          const imageTop = imageCenterY - imageScaledHeight / 2
          
          const cropX = (frameWidth - cropDimensions.width) / 2
          const cropY = (frameHeight - cropDimensions.height) / 2
          
          const sourceX = (cropX - imageLeft) / imageScale
          const sourceY = (cropY - imageTop) / imageScale
          const sourceWidth = cropDimensions.width / imageScale
          const sourceHeight = cropDimensions.height / imageScale
          
          // Draw only the cropped portion
          exportCtx.drawImage(
            tempImg,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            0,
            0,
            cropDimensions.width,
            cropDimensions.height
          )

          // Create download link for cropped image
          const baseFilename = filename.replace(/\.(png|webp)$/, '')
          const extension = exportFormat
          const filenameWithSize = `${baseFilename}${scaleSuffix}_cropped_${cropDimensions.width}x${cropDimensions.height}.${extension}`
          
          const link = document.createElement('a')
          link.download = filenameWithSize
          link.href = exportCanvas.toDataURL(`image/${exportFormat}`)
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
        tempImg.src = originalImage
      } else {
        // Export the full frame (existing behavior)
        exportCanvas.width = exportWidth
        exportCanvas.height = exportHeight

        // Scale and draw the preview canvas to export canvas
        exportCtx.drawImage(canvas, 0, 0, frameWidth, frameHeight, 0, 0, exportWidth, exportHeight)

        // Add frame size to filename
        const frameSize = `${exportWidth}x${exportHeight}`
        const baseFilename = filename.replace(/\.(png|webp)$/, '')
        const extension = exportFormat
        const filenameWithSize = `${baseFilename}${scaleSuffix}_${frameSize}.${extension}`
        
        // Create download link
        const link = document.createElement('a')
        link.download = filenameWithSize
        link.href = exportCanvas.toDataURL(`image/${exportFormat}`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    })
  }, [filename, frameWidth, frameHeight, selectedFrame, selectedExportSizes, exportFormat, exportCroppedOnly, originalImage, imagePosition, imageScale, cropDimensions])

  if (!originalImage) {
    return (
      <div className="preview-panel no-image">
        <h3>Preview</h3>
        <p>Upload an image to see the cropped preview</p>
      </div>
    )
  }

  // Calculate display size for canvas to fit in sidebar while maintaining aspect ratio
  const getDisplaySize = () => {
    const maxWidth = 250 // Approximate sidebar width minus padding
    const maxHeight = 250 // Max height for preview
    
    const aspectRatio = frameWidth / frameHeight
    
    let displayWidth = maxWidth
    let displayHeight = maxWidth / aspectRatio
    
    if (displayHeight > maxHeight) {
      displayHeight = maxHeight
      displayWidth = maxHeight * aspectRatio
    }
    
    return { width: displayWidth, height: displayHeight }
  }

  const displaySize = getDisplaySize()

  return (
    <div className="preview-panel">
      <h3>Preview</h3>
      <div className="preview-container">
        <canvas
          ref={canvasRef}
          className="preview-canvas"
          style={{
            width: `${displaySize.width}px`,
            height: `${displaySize.height}px`
          }}
        />
      </div>
      <div className="preview-info">
        <div className="size-info-row">
          <div className="size-label">FRAME:</div>
          <div className="size-value">{frameWidth} × {frameHeight}px</div>
        </div>
        <div className="size-info-row">
          <div className="size-label">CROP:</div>
          <div className="size-value">{cropDimensions.width} × {cropDimensions.height}px</div>
        </div>
        {(cropDimensions.x !== 0 || cropDimensions.y !== 0) && (
          <div className="size-info-row">
            <div className="size-label">POSITION:</div>
            <div className="size-value">({cropDimensions.x}, {cropDimensions.y})</div>
          </div>
        )}
        <div className="size-info-row">
          <div className="size-label">SCALE:</div>
          <div className="size-value">{imageScale.toFixed(2)}x</div>
        </div>
      </div>

      {/* Export Options */}
      {selectedFrame && selectedFrame.exportSizes && selectedFrame.exportSizes.length > 0 && (
        <div className="export-options">
          <h4>Export Options</h4>
          
          <div className="export-size-selector">
            <label>Export Sizes:</label>
            <div className="export-size-checkboxes">
              {selectedFrame.exportSizes.map((size) => (
                <div key={size.name} className="export-size-option">
                  <input
                    type="checkbox"
                    id={`export-${size.name}`}
                    checked={selectedExportSizes.includes(size.name)}
                    onChange={() => dispatch(toggleExportSize(size.name))}
                    className="export-checkbox"
                  />
                  <label htmlFor={`export-${size.name}`}>
                    {size.name.charAt(0).toUpperCase() + size.name.slice(1)} ({size.width} × {size.height})
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="export-format-selector">
            <label htmlFor="export-format">Format:</label>
            <select
              id="export-format"
              value={exportFormat}
              onChange={(e) => dispatch(setExportFormat(e.target.value as 'png' | 'webp'))}
              className="export-select"
            >
              <option value="png">PNG</option>
              <option value="webp">WebP</option>
            </select>
          </div>

          <div className="export-cropped-only">
            <input
              type="checkbox"
              id="export-cropped-only"
              checked={exportCroppedOnly || false}
              onChange={(e) => dispatch(setExportCroppedOnly(e.target.checked))}
              className="export-checkbox"
            />
            <label htmlFor="export-cropped-only">
              Export cropped image only (no frame layers)
            </label>
          </div>
        </div>
      )}
      <div className="filename-input-container">
        <label htmlFor="filename-input" className="filename-label">
          Filename:
        </label>
        <input
          id="filename-input"
          type="text"
          value={filename}
          onChange={(e) => selectedImageKey && dispatch(updateImageFilename({ imageKey: selectedImageKey, filename: e.target.value }))}
          className="filename-input"
          placeholder="Enter filename"
          disabled={!originalImage}
        />
      </div>
      <button 
        className="save-button"
        onClick={handleSave}
        disabled={!originalImage || !filename || filename.trim() === ''}
      >
        Save as {exportFormat.toUpperCase()}
      </button>
    </div>
  )
}

export default PreviewPanel
