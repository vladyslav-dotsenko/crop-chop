// Canvas-only icon rendering methods

export interface IconRenderOptions {
  x: number
  y: number
  fontSize: number
  color: string
}


/**
 * Alternative approach: Use a different font loading method
 * Try loading Font Awesome as a data URL or using a different CDN
 */
export const tryAlternativeFontLoading = async (): Promise<boolean> => {
  try {
    // Try loading from a different CDN
    const fontUrl = 'https://use.fontawesome.com/releases/v6.5.1/fonts/fontawesome-webfont.woff2'
    
    const response = await fetch(fontUrl)
    if (!response.ok) {
      console.warn('Alternative font loading failed')
      return false
    }
    
    const fontData = await response.arrayBuffer()
    const font = new FontFace('FontAwesome', fontData)
    
    await font.load()
    document.fonts.add(font)
    
    console.log('Alternative Font Awesome loaded successfully')
    return true
  } catch (error) {
    console.error('Alternative font loading error:', error)
    return false
  }
}

