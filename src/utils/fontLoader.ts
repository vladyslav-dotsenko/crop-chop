// Font loading utility to ensure Font Awesome is loaded before rendering

export const loadFontForCanvas = async (fontFamily: string, fontWeight: string = '400'): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!document.fonts) {
      // Fallback for browsers without Font Loading API
      console.warn('Font Loading API not supported, using fallback')
      resolve(true)
      return
    }

    // Load the specific font variant
    const fontSpec = `${fontWeight} 16px "${fontFamily}"`
    
    document.fonts.load(fontSpec).then(() => {
      console.log(`Font loaded: ${fontSpec}`)
      resolve(true)
    }).catch((error) => {
      console.error(`Failed to load font: ${fontSpec}`, error)
      resolve(false)
    })
  })
}

export const loadFontAwesomeForCanvas = async (): Promise<boolean> => {
  console.log('Loading Font Awesome for canvas...')
  
  if (!document.fonts) {
    console.warn('Font Loading API not available')
    return false
  }

  // Wait for all fonts to be ready first
  await document.fonts.ready
  console.log('Document fonts ready')

  // Check what fonts are available
  const availableFonts = Array.from(document.fonts).map(font => font.family)
  console.log('Available fonts:', availableFonts)

  // Try to load Font Awesome variants
  const variants = [
    '400 16px "Font Awesome 6 Free"',
    '900 16px "Font Awesome 6 Free"',
    '400 16px "FontAwesome"',
    '900 16px "FontAwesome"'
  ]
  
  try {
    for (const variant of variants) {
      console.log(`Loading font variant: ${variant}`)
      await document.fonts.load(variant)
      console.log(`Successfully loaded: ${variant}`)
    }
    
    // Verify fonts are loaded
    const faLoaded = document.fonts.check('900 16px "Font Awesome 6 Free"')
    const faOldLoaded = document.fonts.check('900 16px "FontAwesome"')
    
    console.log('Font Awesome 6 Free loaded:', faLoaded)
    console.log('FontAwesome loaded:', faOldLoaded)
    
    return faLoaded || faOldLoaded
  } catch (error) {
    console.error('Failed to load Font Awesome variants:', error)
    return false
  }
}

export const checkFontLoaded = (fontFamily: string): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!document.fonts) {
      resolve(true)
      return
    }

    document.fonts.ready.then(() => {
      const font = document.fonts.check(`16px "${fontFamily}"`)
      resolve(font)
    })
  })
}

export const waitForFontAwesome = (): Promise<boolean> => {
  return checkFontLoaded('Font Awesome 6 Free')
}

// Test function to verify Font Awesome is working
export const testFontAwesome = async (): Promise<void> => {
  console.log('Testing Font Awesome rendering...')
  
  // First, test with HTML element to see if Font Awesome works at all
  const testElement = document.createElement('div')
  testElement.style.fontFamily = '"Font Awesome 6 Free"'
  testElement.style.fontWeight = '900'
  testElement.style.fontSize = '24px'
  testElement.style.position = 'absolute'
  testElement.style.left = '-9999px'
  testElement.textContent = '\uf09b' // GitHub icon
  document.body.appendChild(testElement)
  
  const computedStyle = window.getComputedStyle(testElement)
  console.log('HTML Font Awesome test:', {
    fontFamily: computedStyle.fontFamily,
    fontWeight: computedStyle.fontWeight,
    fontSize: computedStyle.fontSize
  })
  
  document.body.removeChild(testElement)

  // Now test with canvas
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // Wait for font to load first
  await loadFontAwesomeForCanvas()

  // Test with a known Font Awesome icon
  ctx.font = '900 24px "Font Awesome 6 Free"'
  const testChar = '\uf09b' // GitHub icon
  const metrics = ctx.measureText(testChar)
  
  console.log('Canvas Font Awesome test:', {
    font: ctx.font,
    testChar,
    width: metrics.width,
    isLoaded: metrics.width > 0,
    actualWidth: metrics.width
  })

  // Also test if the character renders differently than a fallback
  ctx.font = '900 24px Arial'
  const fallbackMetrics = ctx.measureText(testChar)
  
  console.log('Canvas Fallback test:', {
    font: ctx.font,
    testChar,
    width: fallbackMetrics.width,
    actualWidth: fallbackMetrics.width
  })

  // Test with different font names
  const fontNames = ['"Font Awesome 6 Free"', '"FontAwesome"', '"Font Awesome"']
  for (const fontName of fontNames) {
    ctx.font = `900 24px ${fontName}`
    const testMetrics = ctx.measureText(testChar)
    console.log(`Canvas test with ${fontName}:`, {
      width: testMetrics.width,
      actualWidth: testMetrics.width
    })
  }
}
