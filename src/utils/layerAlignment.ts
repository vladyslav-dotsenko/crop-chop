// Layer alignment utilities for frame rendering

export interface AlignmentOptions {
  alignX?: 'left' | 'center' | 'right'
  alignY?: 'top' | 'center' | 'bottom'
  marginX?: number
  marginY?: number
  x?: number
  y?: number
  width?: number
  height?: number
}

export interface FrameDimensions {
  width: number
  height: number
}

/**
 * Calculates the actual position of a layer based on alignment properties
 * @param options - Layer alignment and positioning options
 * @param frameDimensions - Frame dimensions for alignment calculations
 * @param contentWidth - Width of the content being rendered (for text/images)
 * @param contentHeight - Height of the content being rendered (for text/images)
 * @returns Calculated x, y position
 */
export const calculateAlignedPosition = (
  options: AlignmentOptions,
  frameDimensions: FrameDimensions,
  contentWidth?: number,
  contentHeight?: number
): { x: number; y: number } => {
  const {
    alignX = 'left',
    alignY = 'top',
    marginX = 0,
    marginY = 0,
    x: explicitX,
    y: explicitY,
    width: layerWidth,
    height: layerHeight
  } = options

  // If explicit x/y are provided, use them (absolute positioning)
  if (explicitX !== undefined && explicitY !== undefined) {
    return { x: explicitX, y: explicitY }
  }

  let calculatedX = 0
  let calculatedY = 0

  // Calculate X position based on alignment
  switch (alignX) {
    case 'left':
      calculatedX = marginX
      break
    case 'center':
      const contentW = contentWidth || layerWidth || 0
      calculatedX = (frameDimensions.width - contentW) / 2 + marginX
      break
    case 'right':
      const contentWidthForRight = contentWidth || layerWidth || 0
      calculatedX = frameDimensions.width - contentWidthForRight - marginX
      console.log('Right alignment calculation:', {
        frameWidth: frameDimensions.width,
        contentWidth: contentWidthForRight,
        marginX,
        calculatedX
      })
      break
  }

  // Calculate Y position based on alignment
  switch (alignY) {
    case 'top':
      calculatedY = marginY
      break
    case 'center':
      const contentH = contentHeight || layerHeight || 0
      calculatedY = (frameDimensions.height - contentH) / 2 + marginY
      break
    case 'bottom':
      const contentHeightForBottom = contentHeight || layerHeight || 0
      calculatedY = frameDimensions.height - contentHeightForBottom - marginY
      break
  }

  return { x: calculatedX, y: calculatedY }
}

/**
 * Calculates text alignment for canvas rendering
 * @param textAlign - CSS text alignment
 * @param alignX - Layer X alignment
 * @returns Canvas text alignment
 */
export const getCanvasTextAlign = (
  textAlign?: 'left' | 'center' | 'right',
  alignX?: 'left' | 'center' | 'right'
): CanvasTextAlign => {
  // If layer is center or right aligned, adjust text alignment accordingly
  if (alignX === 'center') {
    return 'center'
  } else if (alignX === 'right') {
    return 'right'
  }
  
  // Otherwise use the text alignment property
  return textAlign || 'left'
}

/**
 * Calculates the width of text content for alignment calculations
 * @param ctx - Canvas rendering context
 * @param text - Text content
 * @param fontSize - Font size
 * @param fontFamily - Font family
 * @param fontWeight - Font weight
 * @returns Text width in pixels
 */
export const measureTextWidth = (
  ctx: CanvasRenderingContext2D,
  text: string,
  fontSize: number,
  fontFamily: string,
  fontWeight: string = 'normal'
): number => {
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
  return ctx.measureText(text).width
}
