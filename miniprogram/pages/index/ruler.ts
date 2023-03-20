import { BodyCanvas } from "./canvas";
import { Event, eventEmitter } from "./event";
import { Line } from "./line";
import { RectNode } from "./rect-node";
import { Point2D } from "./type";

export class Ruler extends RectNode{
  static size = 60
  static lineWidth = 20
  static lineSize = 4
  static space = 10
  static bigSpace = 50
  bodyCanvas: BodyCanvas

  constructor(bodyCanvas: BodyCanvas, position:Point2D, {width, height}: {width?: number, height?: number}) {
    super(position, width || Ruler.size + Ruler.lineSize, height || Ruler.size + Ruler.lineSize)
    this.bodyCanvas = bodyCanvas
  }
}
export class HorizonalRuler extends Ruler{
  processingLine = null as Line|null;
  processingLineStartPosition = {x:0, y: 0};
  constructor(bodyCanvas: BodyCanvas) {
    super(bodyCanvas, {x: 0,y: 0}, {width: bodyCanvas.width})
    this.draw(bodyCanvas.ctx!)
    eventEmitter.on(Event.TouchMoveEvent, this.bindTouchMoveEvent)
    eventEmitter.on(Event.TouchStartEvent, this.bindTouchStartEvent)
    eventEmitter.on(Event.TouchEndEvent, this.releaseLine)
  }
  releaseLine = () => {
    this.processingLine = null
    this.processingLineStartPosition = {x:0,y:0}
    this.release()
  }
  bindTouchMoveEvent = (e: WechatMiniprogram.TouchEvent) => {
    if(!this.processingLine && this.isTouch) return
    const {x, y} = e.touches[0] as unknown as Point2D
    const curCanvasPoint = {x: x * this.bodyCanvas.pixelRatio, y: y * this.bodyCanvas.pixelRatio}
    this.isHit(curCanvasPoint)
    if(!this.isTouch && this.processingLine) {
      this.processingLine.move({x: 0, y: y * this.bodyCanvas.pixelRatio - this.processingLineStartPosition.y})
    }
  }
  bindTouchStartEvent = (e: WechatMiniprogram.TouchEvent) => {
    const {x, y} = e.touches[0] as unknown as Point2D
    const canvasX =  x * this.bodyCanvas.pixelRatio
    const canvasY =  y * this.bodyCanvas.pixelRatio
    this.isHit({x:canvasX, y:canvasY})
    if(this.isTouch) {
      if(!this.processingLine) {
        this.processingLine = new Line(this.bodyCanvas.ctx!, {x: 0, y: Ruler.size + Ruler.lineWidth}, {x: this.width, y: Ruler.size + Ruler.lineWidth}, 'cyan')
        this.processingLineStartPosition = {x,y}
      }
    }
  }
  draw(ctx: WechatMiniprogram.CanvasContext) {
    ctx.strokeRect(Ruler.size,0, this.width, Ruler.size)
      for(let i = 0; i < this.width; i += Ruler.space) {
        const lineWidth = i % Ruler.bigSpace === 0 ? Ruler.lineWidth * 1.6 : Ruler.lineWidth
        ctx.beginPath()
        ctx.moveTo(Ruler.size + i, Ruler.size )
        ctx.lineTo(Ruler.size + i, Ruler.size - lineWidth)
        ctx.closePath()
        ctx.stroke()
        const text = ctx.measureText(String(i));
        i % Ruler.bigSpace === 0 && ctx.fillText(String(i),  Ruler.size + i - (text.width / 2), Ruler.size - lineWidth - 2)
      }
  }
}

export class VerticalRuler extends Ruler{
  processingLine = null as Line|null;
  processingLineStartPosition = {x:0, y: 0};
  constructor(bodyCanvas: BodyCanvas) {
    super(bodyCanvas, {x: 0,y: 0}, {height: bodyCanvas.height})
    this.draw(bodyCanvas.ctx!)

    eventEmitter.on(Event.TouchMoveEvent, this.bindTouchMoveEvent)
    eventEmitter.on(Event.TouchStartEvent, this.bindTouchStartEvent)
    eventEmitter.on(Event.TouchEndEvent, this.releaseLine)
  }
  releaseLine = () => {
    this.processingLine = null
    this.processingLineStartPosition = {x:0,y:0}
    this.release()
  }
  bindTouchMoveEvent = (e: WechatMiniprogram.TouchEvent) => {
    if(!this.processingLine && this.isTouch) return
    const {x, y} = e.touches[0] as unknown as Point2D
    const curCanvasPoint = {x: x * this.bodyCanvas.pixelRatio, y: y * this.bodyCanvas.pixelRatio}
    this.isHit(curCanvasPoint)
    if(!this.isTouch && this.processingLine) {
      this.processingLine.move({x: x* this.bodyCanvas.pixelRatio - this.processingLineStartPosition.x, y: 0})
    }
  }
  bindTouchStartEvent = (e: WechatMiniprogram.TouchEvent) => {
    const {x, y} = e.touches[0] as unknown as Point2D
    const canvasX =  x * this.bodyCanvas.pixelRatio
    const canvasY =  y * this.bodyCanvas.pixelRatio
    this.isHit({x:canvasX, y:canvasY})
    if(this.isTouch) {
      if(!this.processingLine) {
        this.processingLine = new Line(this.bodyCanvas.ctx!, {x: Ruler.size + Ruler.lineWidth, y: 0}, {x: Ruler.size + Ruler.lineWidth + this.width, y: this.height}, 'cyan')
        this.processingLineStartPosition = {x,y}
      }
    }
  }
  draw(ctx: WechatMiniprogram.CanvasContext) {
    ctx.lineWidth = Ruler.lineSize
    ctx.strokeStyle  = '#BABABA'
    ctx.fillStyle = '#BABABA'
    ctx.strokeRect(0,0, Ruler.size, this.height)
    for(let i = 0; i < this.height; i += Ruler.space) {
      const lineWidth = i % Ruler.bigSpace === 0 ? Ruler.lineWidth * 1.6 : Ruler.lineWidth
      ctx.beginPath()
      ctx.moveTo(Ruler.size, i)
      ctx.lineTo(Ruler.size - lineWidth, i)
      ctx.closePath()
      ctx.stroke()
      const text = ctx.measureText(String(i));
      ctx.font = '16px serif'
      i % Ruler.bigSpace === 0 && ctx.fillText(String(i), Ruler.size - lineWidth - text.width, i + 6)
    }
  }
}

export class RulerManagement{
  verticalRuler: Ruler
  horizonalRuler: Ruler;
  constructor(canvas: BodyCanvas) {
    this.verticalRuler = new VerticalRuler(canvas)
    this.horizonalRuler = new HorizonalRuler(canvas)
  }
}

