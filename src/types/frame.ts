export interface Frame {
  id: string
  title: string
  width: number
  height: number
  description: string
  isCustom?: boolean
}

export interface FrameConfig {
  frames: Frame[]
}
