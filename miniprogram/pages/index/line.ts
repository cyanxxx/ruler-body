import { BodyCanvas } from "./canvas";
import { INITIAL_LINE_COLOR } from "./constant";
import { Event, eventEmitter } from "./event";
import { Point2D } from "./type";

export class Line{
  static color = INITIAL_LINE_COLOR
  bodyCanvas: BodyCanvas
  startPosition: Point2D;
  endPosition: Point2D;
  isHide: boolean = false;
  color = Line.color
  lastTapTime: number = 0;
  constructor(bodyCanvas: BodyCanvas, startPosition: Point2D, endPosition: Point2D) {
    this.bodyCanvas = bodyCanvas
    this.startPosition = startPosition
    this.endPosition = endPosition
    bodyCanvas.addItem(this)

    eventEmitter.on(Event.TapEvent, this.bindTouchEvent)
    eventEmitter.on(Event.TogglerLineSwicth, this.toggleHide)
  }

  toggleHide = (lineSwitch: boolean) => {
    this.isHide = !lineSwitch
    this.bodyCanvas.redraw()
  }

  isHit(point: Point2D) {
    const offset = 60
    console.log(this.startPosition.x - offset, this.endPosition.x + offset, this.startPosition.y - offset, this.endPosition.y + offset)
    const { x, y } = point
    return  !(x < this.startPosition.x - offset
        || x > this.endPosition.x + offset
        || y < this.startPosition.y - offset
        || y > this.endPosition.y + offset
      )
  }

  bindTouchEvent = (e:  WechatMiniprogram.Event) => {
    const { clientX: x, clientY: y} = e.touches[0]
    const { pixelRatio } = this.bodyCanvas
    if(this.isHit({x: x * pixelRatio, y: y * pixelRatio})) {
      let currentTime = e.timeStamp
      if (currentTime - this.lastTapTime < 80) {
        this.destroy()
      }
      this.lastTapTime = Date.now()
    }
  }
  destroy() {
    this.bodyCanvas.removeItem(this)
    eventEmitter.off(Event.TapEvent, this.bindTouchEvent)
  }
  move({x: dx, y: dy}:Point2D) {
    const {startPosition, endPosition } = this
    startPosition.x += dx
    startPosition.y += dy

    endPosition.x += dx
    endPosition.y += dy

    this.bodyCanvas.redraw()
    
  }
  moveTo({x, y}:Point2D, {width, height}: {width?: number, height?: number}) {
    const {startPosition, endPosition } = this
    startPosition.x = x 
    startPosition.y = y 

    endPosition.x = x + (width || 0)
    endPosition.y = y + (height || 0)

    this.bodyCanvas.redraw()
  }
  draw() {
    const {bodyCanvas, startPosition, endPosition } = this
    const { ctx } = bodyCanvas
    ctx!.beginPath()
    ctx!.moveTo(startPosition.x, startPosition.y)
    ctx!.lineTo(endPosition.x, endPosition.y)
    ctx!.strokeStyle = this.color
    ctx!.stroke()
    ctx!.closePath()
  }
}  