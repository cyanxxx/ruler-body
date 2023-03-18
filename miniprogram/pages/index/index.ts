// index.ts

import Grid from "../../miniprogram_npm/tdesign-miniprogram/grid/grid"
import { BodyCanvas } from "./canvas"
import { Event, eventEmitter } from "./event"
import { PhotoManagement } from "./photo-management"
import { Ruler } from "./ruler"
import { PhotoGrid } from "./type"

// 获取应用实例
const app = getApp<IAppOption>()

Page({
  static: {
    photoManagement: null as PhotoManagement | null
  },
  data: {
    ctx: null as WechatMiniprogram.CanvasContext | null
  },
  async addPhotos() {
    const bodyCanvas = await this.setBodyCanvas()
    this.setData({
      ctx: bodyCanvas.ctx
    })
    const imageRes = await wx.chooseMedia({
      count: 9,
      mediaType: ['image'],
      // sourceType: ['album', 'camera'],
      sourceType: ['album']
    })
    const ruler = new Ruler(bodyCanvas)
    this.static.photoManagement = new PhotoManagement(bodyCanvas, imageRes.tempFiles, PhotoGrid.VERTICAL, ruler.size + ruler.lineSize)
    
  },
  changeGrid(grid: PhotoGrid) {
    this.static.photoManagement?.changeGrid(grid)
  },
  changeVerticalGrid() {
    this.changeGrid(PhotoGrid.VERTICAL)
  },
  changeHorizontalGrid() {
    this.changeGrid(PhotoGrid.HORIZONTAL)
  },
  canvasTouchStart(e: WechatMiniprogram.Event) {
    eventEmitter.emit(Event.TouchStartEvent, e)
  },
  canvasTouchMove(e: WechatMiniprogram.Event) {
    eventEmitter.emit(Event.TouchMoveEvent, e)
  },
  canvasTouchEnd(e: WechatMiniprogram.Event) {
    eventEmitter.emit(Event.TouchEndEvent, e)
  },
  savePhoto() {
    console.log('savePhoto')
    this.static.photoManagement?.bodyCanvas.savePhoto(this.static.photoManagement)
  },

  async setBodyCanvas() {
    const bodyCanvas = new BodyCanvas('#photoCanvas')
    await bodyCanvas.getContextAndCanvas()
    return bodyCanvas    
  }
})
