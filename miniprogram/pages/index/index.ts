// index.ts

import { PhotoManagement } from "./photo-management"
import { PhotoGrid } from "./type"

// 获取应用实例
const app = getApp<IAppOption>()

Page({
  data: {
    ctx: null
  },
  async addPhotos() {
    const { windowWidth, windowHeight} = wx.getWindowInfo()
    const canvas = await this.getCanvas(windowWidth, windowHeight)
    const imageRes = await wx.chooseMedia({
      count: 9,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
    })
    new PhotoManagement(canvas, this.data.ctx, imageRes.tempFiles, PhotoGrid.HORIZONTAL, windowWidth, windowHeight)

  },
  getCanvas(w: number, h: number) {
    return new Promise((resolve, rej) => {
      wx.createSelectorQuery().select('#photoCanvas')
    .fields({ node: true, size: true })
    .exec((res) => {
        // Canvas 对象
        const canvas = res[0].node
        console.log(canvas)
        // 渲染上下文
        const ctx = canvas.getContext('2d')
        this.setData({ctx})
      
        
        canvas.width = w
        canvas.height = h

        resolve(canvas)
    })
    })
  }
})
