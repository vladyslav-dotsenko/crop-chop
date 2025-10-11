/**
 * Color resolution utilities for frame rendering
 */

/**
 * Resolves background color based on selected option and custom color
 * @param selectedOption - The selected background color option
 * @param customColor - Custom color value (used when selectedOption is 'custom')
 * @returns Resolved color value or gradient configuration
 */
export const resolveBackgroundColor = (
  selectedOption: string,
  customColor?: string
): string | { type: 'gradient'; colors: string[]; direction: string } => {
  switch (selectedOption) {
    case 'lightBlue':
      return '#80D8D8'
    case 'darkBlue':
      return '#204080'
    case 'yellowGold':
      return '#F0D060'
    case 'gradient':
      return {
        type: 'gradient',
        colors: ['#E060E0', '#8040C0'],
        direction: 'to bottom'
      }
    case 'custom':
      return customColor || '#80D8D8'
    default:
      return '#80D8D8'
  }
}

/**
 * Creates a canvas gradient from gradient configuration
 * @param ctx - Canvas rendering context
 * @param gradientConfig - Gradient configuration object
 * @param width - Canvas width
 * @param height - Canvas height
 * @returns Canvas gradient object
 */
export const createCanvasGradient = (
  ctx: CanvasRenderingContext2D,
  gradientConfig: { type: 'gradient'; colors: string[]; direction: string },
  width: number,
  height: number
): CanvasGradient => {
  let gradient: CanvasGradient

  // Create gradient based on direction
  switch (gradientConfig.direction) {
    case 'to bottom right':
      gradient = ctx.createLinearGradient(0, 0, width, height)
      break
    case 'to bottom':
      gradient = ctx.createLinearGradient(0, 0, 0, height)
      break
    case 'to right':
      gradient = ctx.createLinearGradient(0, 0, width, 0)
      break
    case 'to top right':
      gradient = ctx.createLinearGradient(0, height, width, 0)
      break
    default:
      gradient = ctx.createLinearGradient(0, 0, width, height)
  }

  // Add color stops
  gradientConfig.colors.forEach((color, index) => {
    const stop = index / (gradientConfig.colors.length - 1)
    gradient.addColorStop(stop, color)
  })

  return gradient
}
