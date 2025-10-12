export interface FrameParameter {
  id: string
  name: string
  type: 'text' | 'number' | 'select' | 'color' | 'boolean'
  label: string
  defaultValue: any
  options?: { value: string; label: string }[] // for select type
  min?: number // for number type
  max?: number // for number type
  step?: number // for number type
  condition?: string // for conditional parameters
}

export interface FrameLayer {
  id: string
  type: 'background' | 'border' | 'text' | 'image' | 'shape'
  name: string
  visible: boolean
  zIndex: number
  properties: {
    x?: number
    y?: number
    width?: number
    height?: number
    backgroundColor?: string
    customBackgroundColor?: string
    borderColor?: string
    borderWidth?: number
    borderRadius?: number
    color?: string
    fontSize?: number
    fontFamily?: string
    fontWeight?: string
    textAlign?: 'left' | 'center' | 'right'
    content?: string
    imageUrl?: string
    opacity?: number
    // Alignment properties
    alignX?: 'left' | 'center' | 'right'
    alignY?: 'top' | 'center' | 'bottom'
    marginX?: number
    marginY?: number
    [key: string]: any
  }
}

export interface Frame {
  id: string
  title: string
  width: number
  height: number
  description: string
  type?: 'simple' | 'fancy'
  isCustom?: boolean
  parameters?: FrameParameter[]
  layers?: FrameLayer[]
  exportSizes?: {
    name: string
    width: number
    height: number
    scale: number
  }[]
}

export interface FrameConfig {
  frames: Frame[]
}

export interface ComposerState {
  frameParameters: Record<string, Record<string, string>>
  selectedExportSizes: string[]
  exportFormat: 'png' | 'webp'
  customFrameJson: string
  exportCroppedOnly?: boolean
}

// Enum-like union for MTG rarity parameterization
export type Rarity = 'common' | 'uncommon' | 'rare' | 'mythic'
