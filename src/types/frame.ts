export interface Frame {
  id: string
  title: string
  width: number
  height: number
  description: string
}

export interface FrameConfig {
  frames: Frame[]
}
