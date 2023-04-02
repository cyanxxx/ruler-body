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
  isHide: boolean = false

  constructor(bodyCanvas: BodyCanvas, position:Point2D, {width, height}: {width?: number, height?: number}) {
    super(position, width || Ruler.size + Ruler.lineSize, height || Ruler.size + Ruler.lineSize)
    this.bodyCanvas = bodyCanvas
    eventEmitter.on(Event.TogglerRulerSwicth, this.toggleHide)
    eventEmitter.on(Event.LineColorChange, Ruler.changeColor)
  }

  static changeColor = (color: string) => {
    Line.color = color
  }

  toggleHide = (rulerSwitch: boolean) => {
    this.isHide = !rulerSwitch
  }
}
export class HorizonalRuler extends Ruler{
  processingLine = null as Line|null;
  constructor(bodyCanvas: BodyCanvas) {
    super(bodyCanvas, {x: 0,y: 0}, {width: bodyCanvas.width - Ruler.size - Ruler.lineSize})
    bodyCanvas.addItem(this)

    this.draw()
    eventEmitter.on(Event.TouchMoveEvent, this.bindTouchMoveEvent)
    eventEmitter.on(Event.TouchStartEvent, this.bindTouchStartEvent)
    eventEmitter.on(Event.TouchEndEvent, this.releaseLine)
  }
  
  releaseLine = () => {
    this.processingLine = null
    this.release()
  }
  bindTouchMoveEvent = (e: WechatMiniprogram.TouchEvent) => {
    if(!this.processingLine && this.isTouch) return
    const {x, y} = e.touches[0] as unknown as Point2D
    const curCanvasPoint = {x: x * this.bodyCanvas.pixelRatio, y: y * this.bodyCanvas.pixelRatio}
    this.isHit(curCanvasPoint)
    if(!this.isTouch && this.processingLine) {
      this.processingLine.moveTo({x: 0, y: y * this.bodyCanvas.pixelRatio}, {width: this.bodyCanvas.width})
    }
  }
  bindTouchStartEvent = (e: WechatMiniprogram.TouchEvent) => {
    const {x, y} = e.touches[0] as unknown as Point2D
    const canvasX =  x * this.bodyCanvas.pixelRatio
    const canvasY =  y * this.bodyCanvas.pixelRatio
    this.isHit({x:canvasX, y:canvasY})
    if(this.isTouch) {
      if(!this.processingLine) {
        this.processingLine = new Line(this.bodyCanvas, {x: 0, y: Ruler.size + Ruler.lineWidth}, {x: this.width, y: Ruler.size + Ruler.lineWidth})
      }
    }
  }
  draw() {
    const { ctx: ctx } = this.bodyCanvas
    ctx!.lineWidth = Ruler.lineSize;
    ctx!.strokeRect(this.position.x, 0, this.width, Ruler.size)
      for(let i = 0; i < this.width; i += Ruler.space) {
        const lineWidth = i % Ruler.bigSpace === 0 ? Ruler.lineWidth * 1.6 : Ruler.lineWidth
        ctx!.beginPath()
        ctx!.moveTo(i, Ruler.size )
        ctx!.lineTo(i, Ruler.size - lineWidth)
        ctx!.closePath()
        ctx!.stroke()
        const text = ctx!.measureText(String(i));
        i % Ruler.bigSpace === 0 && ctx!.fillText(String(i),  i - (text.width / 2), Ruler.size - lineWidth - 2)
      }
  }
}

export class VerticalRuler extends Ruler{
  processingLine = null as Line|null;
  constructor(bodyCanvas: BodyCanvas) {
    super(bodyCanvas, {x: bodyCanvas.width - Ruler.size - Ruler.lineSize,y: 0}, {height: bodyCanvas.height})
    this.draw()
    bodyCanvas.addItem(this)

    eventEmitter.on(Event.TouchMoveEvent, this.bindTouchMoveEvent)
    eventEmitter.on(Event.TouchStartEvent, this.bindTouchStartEvent)
    eventEmitter.on(Event.TouchEndEvent, this.releaseLine)
  }
  releaseLine = () => {
    this.processingLine = null
    this.release()
  }
  bindTouchMoveEvent = (e: WechatMiniprogram.TouchEvent) => {
    if(!this.processingLine && this.isTouch) return
    const {x, y} = e.touches[0] as unknown as Point2D
    const curCanvasPoint = {x: x * this.bodyCanvas.pixelRatio, y: y * this.bodyCanvas.pixelRatio}
    this.isHit(curCanvasPoint)
    if(!this.isTouch && this.processingLine) {
      this.processingLine.moveTo({x: x* this.bodyCanvas.pixelRatio, y: 0}, {height: this.bodyCanvas.height})
    }
  }
  bindTouchStartEvent = (e: WechatMiniprogram.TouchEvent) => {
    const {x, y} = e.touches[0] as unknown as Point2D
    const canvasX =  x * this.bodyCanvas.pixelRatio
    const canvasY =  y * this.bodyCanvas.pixelRatio
    this.isHit({x:canvasX, y:canvasY})
    if(this.isTouch) {
      if(!this.processingLine) {
        this.processingLine = new Line(this.bodyCanvas, {x: this.position.x + Ruler.size + Ruler.lineWidth, y: 0}, {x: this.position.x + Ruler.size + Ruler.lineWidth + this.width, y: this.height})
      }
    }
  }
  draw() {
    const { ctx: ctx } = this.bodyCanvas
    ctx!.lineWidth = Ruler.lineSize
    ctx!.strokeStyle  = '#BABABA'
    ctx!.fillStyle = '#BABABA'
    ctx!.strokeRect(this.position.x, 0, Ruler.size, this.height)
    for(let i = 0; i < this.height; i += Ruler.space) {
      const lineWidth = i % Ruler.bigSpace === 0 ? Ruler.lineWidth * 1.6 : Ruler.lineWidth
      ctx!.beginPath()
      ctx!.moveTo(this.position.x + Ruler.size, i)
      ctx!.lineTo(this.position.x + Ruler.size - lineWidth, i)
      ctx!.closePath()
      ctx!.stroke()
      const text = ctx!.measureText(String(i));
      ctx!.font = '16px serif'
      i % Ruler.bigSpace === 0 && ctx!.fillText(String(i), this.position.x + Ruler.size - lineWidth - text.width, i + 6)
    }
  }
}

export class RulerManagement{
  verticalRuler: VerticalRuler
  horizonalRuler: HorizonalRuler;
  constructor(canvas: BodyCanvas) {
    this.verticalRuler = new VerticalRuler(canvas)
    this.horizonalRuler = new HorizonalRuler(canvas)
  }
}

