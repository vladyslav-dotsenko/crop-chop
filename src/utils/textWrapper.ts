/**
 * Text wrapping utilities for canvas rendering
 */

/**
 * Wraps text to fit within a specified maximum width
 * @param ctx - Canvas rendering context
 * @param text - Text to wrap
 * @param maxWidth - Maximum width in pixels
 * @returns Array of text lines
 */
export const wrapText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] => {
  if (!text || maxWidth <= 0) {
    return [text || '']
  }

  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    const metrics = ctx.measureText(testLine)
    
    if (metrics.width <= maxWidth) {
      currentLine = testLine
    } else {
      if (currentLine) {
        lines.push(currentLine)
        currentLine = word
      } else {
        // Single word is too long, force it on its own line
        lines.push(word)
        currentLine = ''
      }
    }
  }

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

/**
 * Renders wrapped text on canvas
 * @param ctx - Canvas rendering context
 * @param text - Text to render
 * @param x - X position
 * @param y - Y position
 * @param maxWidth - Maximum width for wrapping
 * @param lineHeight - Height between lines (defaults to font size * 1.2)
 * @param textAlign - Text alignment
 */
export const renderWrappedText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight?: number,
  textAlign: CanvasTextAlign = 'left'
): void => {
  if (!text || maxWidth <= 0) {
    return
  }

  const lines = wrapText(ctx, text, maxWidth)
  const fontSize = parseInt(ctx.font.match(/\d+/)?.[0] || '16')
  const actualLineHeight = lineHeight || fontSize * 1.2

  ctx.textAlign = textAlign

  lines.forEach((line, index) => {
    const lineY = y + (index * actualLineHeight)
    ctx.fillText(line, x, lineY)
  })
}

/**
 * Calculates the height needed for wrapped text
 * @param ctx - Canvas rendering context
 * @param text - Text to measure
 * @param maxWidth - Maximum width for wrapping
 * @param lineHeight - Height between lines (defaults to font size * 1.2)
 * @returns Total height needed
 */
export const getWrappedTextHeight = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  lineHeight?: number
): number => {
  if (!text || maxWidth <= 0) {
    return 0
  }

  const lines = wrapText(ctx, text, maxWidth)
  const fontSize = parseInt(ctx.font.match(/\d+/)?.[0] || '16')
  const actualLineHeight = lineHeight || fontSize * 1.2

  return lines.length * actualLineHeight
}
