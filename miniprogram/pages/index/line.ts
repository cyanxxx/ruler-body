import { Point2D } from "./type";

export class Line{
  ctx: WechatMiniprogram.CanvasContext;
  startPosition: Point2D;
  endPosition: Point2D;
  color: string;
  constructor(ctx: WechatMiniprogram.CanvasContext, startPosition: Point2D, endPosition: Point2D, color: string) {
    this.ctx = ctx
    this.startPosition = startPosition
    this.endPosition = endPosition
    this.color = color
  }
  move({x: dx, y: dy}:Point2D) {
    const {startPosition, endPosition } = this
    startPosition.x += dx
    startPosition.y += dy

    endPosition.x += dx
    endPosition.y += dy

    this.draw()

  }
  draw() {
    const {ctx, startPosition, endPosition, color } = this
    ctx.beginPath()
    ctx.moveTo(startPosition.x, startPosition.y)
    ctx.lineTo(endPosition.x, endPosition.y)
    ctx.strokeStyle = color
    ctx.stroke()
    ctx.closePath()
  }
}  