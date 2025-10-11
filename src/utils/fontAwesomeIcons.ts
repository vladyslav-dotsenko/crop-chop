// Font Awesome icon mapping (common icons)
// Maps FA class names to their Unicode characters for Font Awesome 6 Free
export const fontAwesomeIcons: Record<string, string> = {
  // Social media
  'github': '\uf09b',
  'twitter': '\uf099',
  'x-twitter': '\ue61b',
  'linkedin': '\uf08c',
  'linkedin-in': '\uf0e1',
  'facebook': '\uf09a',
  'facebook-f': '\uf39e',
  'instagram': '\uf16d',
  'youtube': '\uf167',
  'discord': '\uf392',
  'twitch': '\uf1e8',
  'reddit': '\uf1a1',
  'telegram': '\uf2c6',
  'whatsapp': '\uf232',
  'tiktok': '\ue07b',
  'snapchat': '\uf2ab',
  'pinterest': '\uf0d2',
  
  // Professional
  'envelope': '\uf0e0',
  'globe': '\uf0ac',
  'link': '\uf0c1',
  'briefcase': '\uf0b1',
  'graduation-cap': '\uf19d',
  'building': '\uf1ad',
  'phone': '\uf095',
  'mobile': '\uf3cd',
  
  // Common UI
  'user': '\uf007',
  'users': '\uf0c0',
  'heart': '\uf004',
  'star': '\uf005',
  'bookmark': '\uf02e',
  'comment': '\uf075',
  'share': '\uf064',
  'trophy': '\uf091',
  'award': '\uf559',
  'medal': '\uf5a2',
  'crown': '\uf521',
  
  // Arrows and navigation
  'arrow-right': '\uf061',
  'arrow-left': '\uf060',
  'arrow-up': '\uf062',
  'arrow-down': '\uf063',
  'chevron-right': '\uf054',
  'chevron-left': '\uf053',
  'chevron-up': '\uf077',
  'chevron-down': '\uf078',
  
  // Actions
  'download': '\uf019',
  'upload': '\uf093',
  'check': '\uf00c',
  'times': '\uf00d',
  'plus': '\uf067',
  'minus': '\uf068',
  'search': '\uf002',
  'edit': '\uf044',
  'trash': '\uf1f8',
  'save': '\uf0c7',
  
  // Other common
  'home': '\uf015',
  'cog': '\uf013',
  'bell': '\uf0f3',
  'calendar': '\uf133',
  'clock': '\uf017',
  'location-dot': '\uf3c5',
  'map-marker': '\uf041',
  'camera': '\uf030',
  'image': '\uf03e',
  'video': '\uf03d',
  'music': '\uf001',
  'file': '\uf15b',
  'folder': '\uf07b',
  'shopping-cart': '\uf07a',
  'gift': '\uf06b',
  'code': '\uf121',
  'terminal': '\uf120',
  'fire': '\uf06d',
  'bolt': '\uf0e7',
  'rocket': '\uf135',
  'palette': '\uf53f',
  'paint-brush': '\uf1fc',
  'hammer': '\uf6e3',
  'wrench': '\uf0ad',
  'sun': '\uf185',
  'moon': '\uf186',
}

/**
 * Converts Font Awesome class names to Unicode characters
 * @param iconClasses - Space-separated FA icon classes (e.g., "fa-github fa-twitter fa-linkedin")
 * @returns Unicode string with icon characters
 */
export const convertFAClassesToUnicode = (iconClasses: string): string => {
  if (!iconClasses) return ''
  
  // Split by spaces and filter out empty strings
  const classes = iconClasses.split(/\s+/).filter(Boolean)
  
  const unicodeChars = classes
    .map(cls => {
      // Remove 'fa-' prefix if present
      const iconName = cls.replace(/^fa-/, '')
      const unicode = fontAwesomeIcons[iconName]
      if (unicode) {
        console.log(`Converting ${cls} -> ${iconName} -> ${unicode}`)
        return unicode
      }
      console.warn(`No Unicode found for icon: ${iconName}`)
      return ''
    })
    .filter(Boolean)
    .join(' ')
  
  console.log(`Final Unicode string: "${unicodeChars}"`)
  return unicodeChars
}

/**
 * Alternative method: Get Font Awesome CSS classes for rendering
 * @param iconClasses - Space-separated FA icon classes
 * @returns Array of CSS class names
 */
export const getFAClasses = (iconClasses: string): string[] => {
  if (!iconClasses) return []
  
  return iconClasses.split(/\s+/).filter(Boolean).map(cls => {
    // Ensure 'fa-' prefix is present
    return cls.startsWith('fa-') ? cls : `fa-${cls}`
  })
}

