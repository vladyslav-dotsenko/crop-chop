// Reusable function to clamp image position within frame bounds
export const clampImagePosition = (
  position: { x: number; y: number },
  imageWidth: number,
  imageHeight: number,
  scale: number,
  frameWidth: number,
  frameHeight: number
) => {
  // Calculate scaled image dimensions
  const scaledImageWidth = imageWidth * scale
  const scaledImageHeight = imageHeight * scale
  
  // Calculate panning bounds
  // The image should not be panned so that the frame shows empty space
  const maxOffsetX = Math.max(0, (scaledImageWidth - frameWidth) / 2)
  const maxOffsetY = Math.max(0, (scaledImageHeight - frameHeight) / 2)
  const minOffsetX = -maxOffsetX
  const minOffsetY = -maxOffsetY
  
  // Apply panning constraints
  return {
    x: Math.max(minOffsetX, Math.min(maxOffsetX, position.x)),
    y: Math.max(minOffsetY, Math.min(maxOffsetY, position.y))
  }
}
