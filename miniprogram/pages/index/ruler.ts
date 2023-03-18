import { BodyCanvas } from "./canvas";

export class Ruler{
  size = 60
  lineWidth = 20
  lineSize = 4
  space = 10
  bigSpace = 50

  constructor(canvas: BodyCanvas) {
    const { ctx, width, height } = canvas
    
    this.drawVerticalLine(ctx!, height)
    this.drawHorizonalLine(ctx!, width!)
  }
  drawVerticalLine(ctx: WechatMiniprogram.CanvasContext, line: number) {
    ctx.lineWidth = this.lineSize
    ctx.strokeStyle  = '#BABABA'
    ctx.fillStyle = '#BABABA'
    ctx.strokeRect(0,0, this.size, line)
    for(let i = 0; i < line; i += this.space) {
      const lineWidth = i % this.bigSpace === 0 ? this.lineWidth * 1.6 : this.lineWidth
      ctx.beginPath()
      ctx.moveTo(this.size, i)
      ctx.lineTo(this.size - lineWidth, i)
      ctx.closePath()
      ctx.stroke()
      const text = ctx.measureText(String(i));
      ctx.font = '16px serif'
      i % this.bigSpace === 0 && ctx.fillText(String(i), this.size - lineWidth - text.width, i + 6)
    }
  }
    drawHorizonalLine(ctx: WechatMiniprogram.CanvasContext, line: number) {
      ctx.strokeRect(this.size,0, line, this.size)
      for(let i = 0; i < line; i += this.space) {
        const lineWidth = i % this.bigSpace === 0 ? this.lineWidth * 1.6 : this.lineWidth
        ctx.beginPath()
        ctx.moveTo(this.size + i, this.size )
        ctx.lineTo(this.size + i, this.size - lineWidth)
        ctx.closePath()
        ctx.stroke()
        const text = ctx.measureText(String(i));
        i % this.bigSpace === 0 && ctx.fillText(String(i),  this.size + i - (text.width / 2), this.size - lineWidth - 2)
      }
  }
}