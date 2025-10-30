import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState } from '../../store'
import { setSaveModalOpen } from '../../store/slices'
import { toggleExportSize, setExportFormat, setExportCroppedOnly, updateImageFilename } from '../../store/slices'
import { loadFontAwesomeForCanvas, tryAlternativeFontLoading, testFontAwesome, convertFAClassesToUnicode, calculateAlignedPosition, getCanvasTextAlign, measureTextWidth, renderWrappedText, resolveBackgroundColor, createCanvasGradient, getCropAreaDimensions } from '../../utils'
import type { Frame } from '../../types'
import './SaveConfigModal.css'

const interpolateAgainst = (state: Record<string, string>) => (_: string, p1: string) => state[p1]
const interpolateValue = (value: string, state: Record<string, string>) =>
  value.replace(/{{(\w+)}}/g, interpolateAgainst(state))

const SaveConfigModal: React.FC = () => {
  const dispatch = useDispatch()
  const isOpen = useSelector((s: RootState) => s.ui.isSaveModalOpen)
  const { selectedFrame } = useSelector((s: RootState) => s.frameSelector)
  const { frameParameters, selectedExportSizes, exportFormat, exportCroppedOnly } = useSelector((s: RootState) => s.framesComposer)
  const { images, selectedImageKey } = useSelector((s: RootState) => s.imageCropper)

  const selectedImage = selectedImageKey ? images[selectedImageKey] : null
  const originalImage = selectedImage?.originalImage || null
  const imagePosition = selectedImage?.imagePosition || { x: 0, y: 0 }
  const imageScale = selectedImage?.imageScale || 1
  const filename = selectedImage?.filename || 'cropped-image'

  const frameWidth = selectedFrame?.width || 300
  const frameHeight = selectedFrame?.height || 200

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const [loadedImages, setLoadedImages] = useState<Record<string, HTMLImageElement>>({})
  const [previewDataUrl, setPreviewDataUrl] = useState<string>('')

  const cropDimensions = useMemo(() => getCropAreaDimensions(selectedFrame, frameWidth, frameHeight), [selectedFrame, frameWidth, frameHeight])

  useEffect(() => {
    if (!isOpen) return
    const init = async () => {
      let ok = await loadFontAwesomeForCanvas()
      if (!ok) ok = await tryAlternativeFontLoading()
      await testFontAwesome()
    }
    init()
  }, [isOpen])

  useEffect(() => {
    if (!selectedFrame || !selectedFrame.layers) return
    const imagesToLoad: { url: string; key: string }[] = []
    selectedFrame.layers.forEach(layer => {
      if (layer.type === 'image' && layer.properties.imageUrl && layer.properties.imageUrl !== '{{croppedImage}}') {
        let imageUrl = layer.properties.imageUrl
        if (selectedFrame.parameters) {
          selectedFrame.parameters.forEach(param => {
            imageUrl = imageUrl.replace(`{{${param.id}}}`, String(param.defaultValue ?? ''))
          })
        }
        imagesToLoad.push({ url: imageUrl, key: layer.id })
      }
    })
    const loadAll = async () => {
      const results = await Promise.all(imagesToLoad.map(({ url, key }) => new Promise<{ key: string; img: HTMLImageElement }>((resolve, reject) => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => resolve({ key, img })
        img.onerror = reject
        img.src = url
      })))
      const map: Record<string, HTMLImageElement> = {}
      results.forEach(({ key, img }) => { map[key] = img })
      setLoadedImages(map)
    }
    loadAll().catch(() => {})
  }, [selectedFrame])

  const renderFrameLayers = useCallback(async (ctx: CanvasRenderingContext2D, frame: Frame, width: number, height: number, croppedImage?: HTMLImageElement, sourceX?: number, sourceY?: number, sourceWidth?: number, sourceHeight?: number) => {
    await loadFontAwesomeForCanvas()
    const frameDimensions = { width, height }
    const getParameterValue = (frame: Frame, parameterId: string) => {
      if (!frame.parameters) return ''
      const param = frame.parameters.find(p => p.id === parameterId)
      if (!param) return ''
      const state = frameParameters[frame.id] || {}
      const v = state[parameterId]
      return v !== undefined ? v : param.defaultValue
    }
    if (!frame.layers) return
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
            const resolvedColor = resolveBackgroundColor(backgroundColorOption, customBackgroundColor)
            if (typeof resolvedColor === 'string') {
              ctx.fillStyle = resolvedColor
            } else if (resolvedColor.type === 'gradient') {
              const gradient = createCanvasGradient(ctx, resolvedColor, props.width || width, props.height || height)
              ctx.fillStyle = gradient
            }
            if (props.borderRadius) {
              ctx.beginPath()
              // @ts-ignore
              ctx.roundRect(props.x || 0, props.y || 0, props.width || width, props.height || height, props.borderRadius)
              ctx.fill()
            } else {
              ctx.fillRect(props.x || 0, props.y || 0, props.width || width, props.height || height)
            }
          }
          break
        case 'border':
          if (props.borderColor && props.borderWidth) {
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
              ctx.beginPath()
              // @ts-ignore
              ctx.roundRect(props.x || 0, props.y || 0, props.width || width, props.height || height, props.borderRadius)
              ctx.stroke()
            } else {
              ctx.strokeRect(props.x || 0, props.y || 0, props.width || width, props.height || height)
            }
          }
          break
        case 'text':
          if (props.content) {
            let content = props.content
            if (frame.parameters) {
              frame.parameters.forEach(param => {
                const value = getParameterValue(frame, param.id)
                content = content.replace(`{{${param.id}}}`, String(value))
              })
            }
            if (props.fontFamily && props.fontFamily.includes('Font Awesome')) {
              content = convertFAClassesToUnicode(content)
            }
            ctx.fillStyle = props.color || '#ffffff'
            const fontFamily = props.fontFamily || 'Arial'
            const fontWeight = props.fontWeight || 'normal'
            const fontSize = props.fontSize || 16
            if (fontFamily.includes('Font Awesome')) {
              ctx.font = `${fontWeight} ${fontSize}px "Font Awesome 6 Free", "Font Awesome 6 Pro", "FontAwesome", Arial, sans-serif`
            } else {
              ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
            }
            const textWidth = measureTextWidth(ctx, content, fontSize, fontFamily, fontWeight)
            const textHeight = fontSize
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
            ctx.textAlign = getCanvasTextAlign(props.textAlign, props.alignX)
            let x = alignedPos.x
            const y = alignedPos.y + fontSize
            if (ctx.textAlign === 'right') {
              x = frameDimensions.width - (props.marginX || 0)
            } else if (ctx.textAlign === 'center') {
              x = frameDimensions.width / 2
            }
            if (props.maxWidth && props.maxWidth > 0) {
              renderWrappedText(ctx, content, x, y, props.maxWidth, undefined, ctx.textAlign)
            } else {
              ctx.fillText(content, x, y)
            }
          }
          break
        case 'image':
          if (props.imageUrl === '{{croppedImage}}' && croppedImage && sourceX !== undefined && sourceY !== undefined && sourceWidth !== undefined && sourceHeight !== undefined) {
            const x = props.x || 0
            const y = props.y || 0
            const layerWidth = props.width || width
            const layerHeight = props.height || height
            if (props.borderRadius) {
              ctx.save()
              ctx.beginPath()
              // @ts-ignore
              ctx.roundRect(x, y, layerWidth, layerHeight, props.borderRadius)
              ctx.clip()
            }
            ctx.drawImage(
              croppedImage,
              sourceX,
              sourceY,
              sourceWidth,
              sourceHeight,
              x,
              y,
              layerWidth,
              layerHeight
            )
            if (props.borderRadius) {
              ctx.restore()
            }
          } else if (props.imageUrl && props.imageUrl !== '{{croppedImage}}') {
            const img = loadedImages[layer.id]
            if (img) {
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
                // @ts-ignore
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
    if (!isOpen || !originalImage || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const img = new Image()
    img.onload = async () => {
      canvas.width = frameWidth
      canvas.height = frameHeight
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const cropWidth = cropDimensions.width
      const cropHeight = cropDimensions.height
      const cropX = (frameWidth - cropWidth) / 2
      const cropY = (frameHeight - cropHeight) / 2
      const imageScaledWidth = img.width * imageScale
      const imageScaledHeight = img.height * imageScale
      const imageCenterX = frameWidth / 2 + imagePosition.x
      const imageCenterY = frameHeight / 2 + imagePosition.y
      const imageLeft = imageCenterX - imageScaledWidth / 2
      const imageTop = imageCenterY - imageScaledHeight / 2
      const sourceX = (cropX - imageLeft) / imageScale
      const sourceY = (cropY - imageTop) / imageScale
      const sourceWidth = cropWidth / imageScale
      const sourceHeight = cropHeight / imageScale
      if (selectedFrame && selectedFrame.layers) {
        await renderFrameLayers(ctx, selectedFrame, frameWidth, frameHeight, img, sourceX, sourceY, sourceWidth, sourceHeight)
      } else {
        // Fallback: scale cropped source to fill the canvas
        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          frameWidth,
          frameHeight
        )
      }
      // Update data URL for responsive <img> preview
      try {
        const url = canvas.toDataURL(`image/png`)
        setPreviewDataUrl(url)
      } catch {}
    }
    img.src = originalImage
  }, [isOpen, originalImage, imagePosition, imageScale, frameWidth, frameHeight, selectedFrame, renderFrameLayers, cropDimensions])

  const handleClose = () => dispatch(setSaveModalOpen(false))

  const handleSave = useCallback(() => {
    if (!canvasRef.current || !selectedFrame || !originalImage) return
    const canvas = canvasRef.current
    const sizes = selectedExportSizes
    sizes.forEach(sizeName => {
      let exportWidth = frameWidth
      let exportHeight = frameHeight
      let scaleSuffix = ''
      if (sizeName !== 'original' && selectedFrame.exportSizes) {
        const es = selectedFrame.exportSizes.find(s => s.name === sizeName)
        if (es) {
          exportWidth = es.width
          exportHeight = es.height
          scaleSuffix = `_${es.name}`
        }
      }
      const exportCanvas = document.createElement('canvas')
      const exportCtx = exportCanvas.getContext('2d')
      if (!exportCtx) return
      if (exportCroppedOnly) {
        exportCanvas.width = cropDimensions.width
        exportCanvas.height = cropDimensions.height
        const tempImg = new Image()
        tempImg.onload = () => {
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
          exportCtx.drawImage(tempImg, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, cropDimensions.width, cropDimensions.height)
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
        exportCanvas.width = exportWidth
        exportCanvas.height = exportHeight
        exportCtx.drawImage(canvas, 0, 0, frameWidth, frameHeight, 0, 0, exportWidth, exportHeight)
        const frameSize = `${exportWidth}x${exportHeight}`
        const baseFilename = filename.replace(/\.(png|webp)$/, '')
        const extension = exportFormat
        const filenameWithSize = `${baseFilename}${scaleSuffix}_${frameSize}.${extension}`
        const link = document.createElement('a')
        link.download = filenameWithSize
        link.href = exportCanvas.toDataURL(`image/${exportFormat}`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    })
  }, [filename, frameWidth, frameHeight, selectedFrame, selectedExportSizes, exportFormat, exportCroppedOnly, originalImage, imagePosition, imageScale, cropDimensions])

  if (!isOpen) return null

  return (
    <div className="save-modal-overlay">
      <div className="save-modal">
        <div className="save-modal-header">
          <h3>Save</h3>
          <button className="close-button" onClick={handleClose} aria-label="Close modal">×</button>
        </div>
        <div className="save-modal-body">
          <div className="save-left">
            <div className="preview-container" ref={previewContainerRef}>
              {/* Hidden canvas used for rendering, result shown as an image */}
              <canvas
                ref={canvasRef}
                className="preview-canvas-hidden"
                width={frameWidth}
                height={frameHeight}
              />
              <img
                className="preview-image"
                src={previewDataUrl}
                alt="Preview"
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
            </div>
          </div>
          <div className="save-right">
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
                  <label htmlFor="export-format-modal">Format:</label>
                  <select
                    id="export-format-modal"
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
                    id="export-cropped-only-modal"
                    checked={exportCroppedOnly || false}
                    onChange={(e) => dispatch(setExportCroppedOnly(e.target.checked))}
                    className="export-checkbox"
                  />
                  <label htmlFor="export-cropped-only-modal">
                    Export cropped image only (no frame layers)
                  </label>
                </div>
              </div>
            )}
            <div className="filename-input-container">
              <label htmlFor="filename-input-modal" className="filename-label">Filename:</label>
              <input
                id="filename-input-modal"
                type="text"
                value={filename}
                onChange={(e) => selectedImageKey && dispatch(updateImageFilename({ imageKey: selectedImageKey, filename: e.target.value }))}
                className="filename-input"
                placeholder="Enter filename"
                disabled={!originalImage}
              />
            </div>
          </div>
        </div>
        <div className="save-modal-footer">
          <button className="secondary-button" onClick={handleClose}>Cancel</button>
          <button className="primary-button" onClick={handleSave} disabled={!originalImage}>Save as {exportFormat.toUpperCase()}</button>
        </div>
      </div>
    </div>
  )
}

export default SaveConfigModal


