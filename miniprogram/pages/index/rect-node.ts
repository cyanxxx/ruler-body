import { Point2D } from "./type";

export class RectNode{
  position: Point2D
  width: number
  height: number
  isTouch: boolean = false
  
  constructor(position: Point2D, w: number, h: number) {
    this.position = position
    this.width = w
    this.height = h
  }
  isHit(point: Point2D|Point2D[]) {
    let points = []
    if(!Array.isArray(point)) {
      points = [point]
    }else{
      points = point
    }
    this.isTouch = points.every(p => {
      const { x, y } = p
      return  !(x < this.position.x 
          || x > this.position.x + this.width 
          || y < this.position.y
          || y > this.position.y + this.height 
        )
    })
  }
  release = () => {
    this.isTouch = false
  }
}