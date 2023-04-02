// index.ts
import tinycolor from "tinycolor2";
import { BodyCanvas } from "./canvas"
import { INITIAL_LINE_COLOR } from "./constant"
import { Event, eventEmitter } from "./event"
import { PhotoManagement } from "./photo-management"
import { Ruler, RulerManagement } from "./ruler"
import { PhotoGrid } from "./type"

// 获取应用实例
const app = getApp<IAppOption>()

Page({
  static: {
    photoManagement: null as PhotoManagement | null
  },
  data: {
    ctx: null as WechatMiniprogram.CanvasContext | null,
    imgs: [],
    rulerSwitch: true,
    lineSwitch: true,
    layoutRulerMenuOpen: false,
    layoutColorMenuOpen: false,
    color: INITIAL_LINE_COLOR,
    pointerX: 0,
    alreadySetPointX: false,
    saveCanvas: false
  },
  onLoad() {
    eventEmitter.on(Event.AddImage, this.addImgs)
    eventEmitter.on(Event.ResetCanvas, this.removeImgs)
    const ob = wx.createIntersectionObserver(this).relativeToViewport()
    ob.observe('#color-menu-container', () => {
      this.setPointerX()
      ob.disconnect()
    })
  },
  setPointerX() {
    if(this.data.alreadySetPointX)return
    const color = tinycolor(this.data.color).toHsl()
    const percent = color.h / 360
    wx.createSelectorQuery().select("#color-menu-container").boundingClientRect((res) => {
      this.setData({
        pointerX: percent * res.width + res.left,
        alreadySetPointX: true
      })
    }).exec()
  },
  noop() {
   console.log('catch')
  },
  cancelLayoutMenu() {
    const datasetNameGroups = ['rulerMenu', 'colorMenu']
    const stateGroups = datasetNameGroups.map(name => `layout${name[0].toUpperCase()+name.slice(1)}Open`) as ('layoutRulerMenuOpen'|'layoutColorMenuOpen')[]
    stateGroups.filter(s => this.data[s]).forEach(state => {
      this.setData({
        [state]: false
      })
    })
  },
  toggleLayoutMenu(e: WechatMiniprogram.TapEvent) {
    console.log(e)
    const targetEvent = e.currentTarget
    const datasetNameGroups = ['rulerMenu', 'colorMenu']
    
    const name = targetEvent.dataset.name?? ''
   
    if(datasetNameGroups.includes(name)) {
      const state = `layout${name[0].toUpperCase()+name.slice(1)}Open` as ('layoutRulerMenuOpen'|'layoutColorMenuOpen')
      this.setData({
        [state]: !this.data[state]
      })
    }
  },
  hasPhoto() {
    return !!this.data.imgs.length
  },

  addImgs(imgs: []) {
    this.setData({
      imgs
    })
  },
  removeImgs() {
    this.setData({
      imgs: []
    })
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
    const ruler = new RulerManagement(bodyCanvas)
    this.static.photoManagement = new PhotoManagement(bodyCanvas, imageRes.tempFiles, PhotoGrid.VERTICAL, Ruler.size + Ruler.lineSize * 2)
  },
  toggleLineSwitch() {
    const lineSwitch = !this.data.lineSwitch
    this.setData({
      lineSwitch
    })
    eventEmitter.emit(Event.TogglerLineSwicth, lineSwitch)
  },
  togglerRulerSwitch() {
    const rulerSwitch = !this.data.rulerSwitch
    this.setData({
      rulerSwitch
    })
    eventEmitter.emit(Event.TogglerRulerSwicth, rulerSwitch)
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
  canvasTouchStart(e: WechatMiniprogram.TouchEvent) {
    eventEmitter.emit(Event.TouchStartEvent, e)
  },
  canvasTouchMove(e: WechatMiniprogram.TouchEvent) {
    eventEmitter.emit(Event.TouchMoveEvent, e)
  },
  canvasTouchEnd(e: WechatMiniprogram.TouchEvent) {
    eventEmitter.emit(Event.TouchEndEvent, e)
  },
  canvasTap(e: WechatMiniprogram.TouchEvent) {
    eventEmitter.emit(Event.TapEvent, e)
  },
  savePhoto() {
    console.log('savePhoto')
    this.static.photoManagement?.bodyCanvas.savePhoto(this.static.photoManagement)
    this.toggleSavePhotoDiaglog()
  },
  toggleSavePhotoDiaglog() {
    this.setData({
      saveCanvas: !this.data.saveCanvas
    })
  },

  async setBodyCanvas() {
    const bodyCanvas = new BodyCanvas('#photoCanvas')
    await bodyCanvas.getContextAndCanvas()
    return bodyCanvas    
  },

  clearCanvas()  {
    this.static.photoManagement?.bodyCanvas.clear()
  },
  
  changeColor(e: WechatMiniprogram.TouchEvent) {
    wx.createSelectorQuery().select("#color-menu-container").boundingClientRect((res) => {
      console.log(res)
      const x =  e.touches[0].pageX
      const containerWidth = res.width
      const left = x - (res.left)
      const percent = left / containerWidth
      const h = percent * 360
      const color = tinycolor(`hsl(${h}, 100%, 50%)`).toRgbString()
      this.setData({
        color,
        pointerX: left
      })
      eventEmitter.emit(Event.LineColorChange, color) 
    }).exec()
  }
})
