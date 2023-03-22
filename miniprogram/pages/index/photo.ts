import { BodyCanvas } from "./canvas";
import { Event, eventEmitter } from "./event";
import { RectNode } from "./rect-node";
import { Point2D, Tuple } from "./type";

export class Photo extends RectNode{
  bodyCanvas: BodyCanvas;
  gridPosition: Point2D = {x: 0, y: 0}
  moveStartPosition: Point2D = {x: 0, y: 0}
  scaleStartPosition: [Point2D, Point2D]  = [{x: 0, y: 0},{x: 0, y: 0}]
  scaleStartPositionDistance = 0;
  photoWidth: number = 0;
  photoHeight: number = 0;
  image: WechatMiniprogram.Image
  ratio = 1
  constructor(bodyCanvas: BodyCanvas, imagePath : string, paramArr: Tuple<number, 8>) {
    super({x: paramArr[4], y: paramArr[5]}, paramArr[6], paramArr[7])

    let [sx, sy, sw, sh] = paramArr
    const { canvas } = bodyCanvas

    this.bodyCanvas = bodyCanvas
    this.image = canvas!.createImage()
    this.image.src = imagePath
    this.image.onload = () => {
      console.log('img.width', this.image.width)
      console.log('img.height', this.image.height)
      // 求出图片的中间位置
      sx = Math.abs(sx - this.image.width / 2)
      sy = Math.abs(sy - this.image.height / 2)
      this.gridPosition = { x: sx, y: sy }
      this.photoWidth = sw
      this.photoHeight = sh

      this.draw()

      this.bodyCanvas.addItem(this)

    }
    eventEmitter.on(Event.TouchMoveEvent, this.bindTouchMoveEvent)
    eventEmitter.on(Event.TouchStartEvent, this.bindTouchStartEvent)
    eventEmitter.on(Event.TouchEndEvent, this.release)
  }
  bindMoveEvent = (e: WechatMiniprogram.TouchEvent) => {
    const {x, y} = e.touches[0] as unknown as Point2D
    const dx = this.moveStartPosition.x - x 
    const dy = this.moveStartPosition.y - y
    const ratioDx = this.photoWidth * dx / (this.bodyCanvas.cssWidth) * 0.25
    const ratioDy = this.photoHeight * dy / (this.bodyCanvas.cssHeight) * 0.25
    this.move({x: ratioDx,y: ratioDy})
  }
  bindTouchMoveEvent = (e: WechatMiniprogram.TouchEvent) => {
    const finger = e.touches.length
    switch(finger) {
      case 1:
        return this.bindMoveEvent(e)
      case 2:
          return this.bindScaleMoveEvent(e)
      default:
        return
    }
  }
  bindTouchStartEvent = (e: WechatMiniprogram.TouchEvent) => {
    const finger = e.touches.length
    switch(finger) {
      case 1:
        return this.bindMoveStartEvent(e)
      case 2:
          return this.bindScaleStartEvent(e)
      default:
        return
    }
  }
  bindScaleStartEvent = (e: WechatMiniprogram.TouchEvent) => {
    const [{x: x1, y: y1}, {x: x2, y: y2}] = e.touches as unknown as [Point2D, Point2D]
    
    this.isHit([{x: x1, y: y1}, {x: x2, y: y2}].map(p => ({x: p.x * this.bodyCanvas.pixelRatio, y: p.y * this.bodyCanvas.pixelRatio})))
    if(this.isTouch) {
      this.scaleStartPosition = [{x: x1, y: y1}, {x: x2, y: y2}]
      this.scaleStartPositionDistance = Math.hypot(x1-x2, y1-y2)
    }
  }
  bindMoveStartEvent = (e: WechatMiniprogram.TouchEvent) => {
    const {x, y} = e.touches[0] as unknown as Point2D

    this.isHit({x: x * this.bodyCanvas.pixelRatio,y: y * this.bodyCanvas.pixelRatio})
    if(this.isTouch) {
      this.moveStartPosition = {x, y}
    }    
  }
  destroy() {
    this.bodyCanvas.removeItem(this)
    eventEmitter.off(Event.TouchMoveEvent, this.bindTouchMoveEvent)
    eventEmitter.off(Event.TouchStartEvent, this.bindTouchStartEvent)
    eventEmitter.off(Event.TouchEndEvent, this.release)
  }
  bindScaleMoveEvent(e: WechatMiniprogram.TouchEvent) {
    const [{x: x1, y: y1}, {x: x2, y: y2}] = e.touches as unknown as [Point2D, Point2D]
    this.scale( [{x: x1, y: y1}, {x: x2, y: y2}])
  }
  scale(points: [Point2D, Point2D]) {
    if(!this.isTouch) return
    const [{x: x1, y: y1}, {x: x2, y: y2}] = points
    const distance = Math.hypot(x1-x2, y1-y2)
    const deltaDistance = distance - this.scaleStartPositionDistance
    const ratio = 1 - (deltaDistance / this.bodyCanvas.cssSize * 0.5)
    const { ctx } = this.bodyCanvas
    const centerPoint = {x: (this.gridPosition.x + this.photoWidth) / 2, y:  (this.gridPosition.y + this.photoHeight) / 2 }
    const offset = {x: centerPoint.x * -(ratio - this.ratio), y: centerPoint.y * -(ratio - this.ratio)}
    ctx?.clearRect(this.position.x, this.position.y, this.width, this.height)

    this.gridPosition.x += offset.x
    this.gridPosition.y += offset.y
    this.ratio = ratio
    this.photoWidth = this.ratio * this.photoWidth
    this.photoHeight = this.ratio * this.photoHeight
    console.log(ratio)
    
    this.bodyCanvas.redraw()
  }
  move(point: Point2D) {
    if(!this.isTouch) return
    const { x,y } = point
    const { ctx } = this.bodyCanvas
    this.gridPosition.x += x
    this.gridPosition.y += y
    console.log(this.gridPosition.x, this.gridPosition.y, this.photoWidth, this.photoHeight, this.position.x, this.position.y, this.width, this.height)
    ctx?.clearRect(this.position.x, this.position.y, this.width, this.height)

    this.bodyCanvas.redraw()
  }
  draw() {
    const { ctx } = this.bodyCanvas
    //@ts-ignore
    ctx!.drawImage(this.image, this.gridPosition.x, this.gridPosition.y, this.photoWidth, this.photoHeight, this.position.x, this.position.y, this.width, this.height)
  }
}