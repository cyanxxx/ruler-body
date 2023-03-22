import { Event, eventEmitter } from "./event"
import { PhotoManagement } from "./photo-management"

interface Graphic {
  draw: () => void;
  destroy?: () => void;
}

export class BodyCanvas{
  canvas: WechatMiniprogram.Canvas | null = null
  hiddenCanvas: WechatMiniprogram.Canvas | null = null
  ctx: WechatMiniprogram.CanvasContext | null = null
  hiddenCtx: WechatMiniprogram.CanvasContext| null = null

  graphics: Graphic[] = []
  pixelRatio: number = 1
  id: string
  
  get width() {
    return this.canvas?.width || 0
  }

  get cssWidth() {
    return this.width / this.pixelRatio
  }

  get height() {
    return this.canvas?.height || 0
  }

  get cssHeight() {
    return this.height / this.pixelRatio
  }

  get cssSize() {
    return Math.hypot(this.cssWidth, this.cssHeight)
  }
  
  constructor(selector: string) {
    this.id = selector
  }
  
  addItem(graphic: Graphic) {
    this.graphics.push(graphic)
  }
  removeItem(graphic: Graphic) {
    this.graphics = this.graphics.filter(g => g !== graphic)
    this.redraw()
  }

  redraw() {
    this.ctx?.clearRect(0,0,this.width, this.height)
    this.graphics.forEach(g => g.draw())
  }

  clear() {
    this.ctx?.clearRect(0,0,this.width, this.height)
    this.graphics.forEach(g => g.destroy && g.destroy())
    this.graphics = []
    eventEmitter.emit(Event.RESETCANVAS)
  }

  async getContextAndCanvas() {
    const {canvas, ctx} = await this.getCanvasNodeAndCtx(this.id)
    const {canvas: hiddenCanvas, ctx: hiddenCtx} = await this.getCanvasNodeAndCtx(`#hidden-${this.id.slice(1)}`)
    this.canvas = canvas
    this.ctx = ctx
    this.hiddenCanvas = hiddenCanvas
    this.hiddenCtx = hiddenCtx
    this.setCanvasSize(this.canvas)
    this.setCanvasSize(this.hiddenCanvas)
  }

  getCanvasNodeAndCtx(selector: string) {
    return new Promise<{canvas: WechatMiniprogram.Canvas, ctx: WechatMiniprogram.CanvasContext}>((resolve, reject) => {
      wx.createSelectorQuery().select(selector).fields({ node: true }).exec((res) => {
        const canvas = res[0].node as WechatMiniprogram.Canvas
          console.log(canvas)
          // 渲染上下文
          const ctx = canvas.getContext('2d')
          resolve({canvas, ctx}) 
      })
    })
  }
  setCanvasSize(canvas: WechatMiniprogram.Canvas | null) {
    if(!canvas)return
    const { windowWidth, windowHeight, pixelRatio } = wx.getWindowInfo()
   canvas.width = windowWidth * pixelRatio
   canvas.height = windowHeight * pixelRatio
   this.pixelRatio = pixelRatio
    // this.ctx.scale(pixelRatio, pixelRatio)
  }

  savePhoto(photoManagement: PhotoManagement){
    const { x, y } = photoManagement.position
    //@ts-ignore
    const imageData = this.ctx!.getImageData(x, y, photoManagement.width, photoManagement.photoCanvasHeight)
  
    //@ts-ignore
    this.hiddenCtx!.putImageData(imageData, 0, 0)
    wx.canvasToTempFilePath({
      canvas: this.hiddenCanvas!,
      quality: 1,
      fileType: 'png',
      width: photoManagement.width / this.pixelRatio,
      height: photoManagement.photoCanvasHeight / this.pixelRatio,
      success: res => {
        console.log(res.tempFilePath)
        this.ctx?.restore()
          // 生成的图片临时文件路径
          wx.saveImageToPhotosAlbum({ 
            filePath: res.tempFilePath, 
            success(res) {
              wx.showToast({
                title:'保存成功',
                icon: 'none',
                duration: 2000
              });
          }
        })
      },
      fail: (res) => {
        console.log(res)
      }
  })
  }
}