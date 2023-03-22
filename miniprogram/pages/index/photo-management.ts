import { BodyCanvas } from "./canvas";
import { Event, eventEmitter } from "./event";
import { Photo } from "./photo";
import { PhotoGrid, Point2D, Tuple } from "./type";

export class PhotoManagement{
  horizintalSpace: number;
  width: number;
  photoCanvasHeight: number;
  offset: number;
  grid:PhotoGrid;
  images: WechatMiniprogram.MediaFile[];
  bodyCanvas: BodyCanvas;
  photos: Photo[] = [];
  position: Point2D;
  constructor(bodyCanvas: BodyCanvas, images: WechatMiniprogram.MediaFile[], grid: PhotoGrid, offset: number) {
    let { width, height, ctx } = bodyCanvas
    this.bodyCanvas = bodyCanvas
    this.images = images
    this.width = width! - offset
    this.horizintalSpace = (height - offset) * 0.25
    this.photoCanvasHeight = this.horizintalSpace * 2
    this.offset = offset
    this.position = {x: 0, y: offset + this.horizintalSpace}
    this.drawBackGround()

    this[grid](bodyCanvas, images)
    this.grid = grid

    eventEmitter.emit(Event.ADDIMAGE, images)
  }
  drawBackGround() {
    let { height, ctx } = this.bodyCanvas
    ctx!.fillStyle = '#F5F5F5'
    ctx!.fillRect(0, this.offset, this.width, height)
  }
  changeGrid(grid: PhotoGrid) {
    if(this.grid === grid)return
    this.grid = grid
    this.photos.forEach(p => p.destroy())
    this.photos = []
    this.bodyCanvas.ctx?.clearRect(0, this.offset, this.width, this.photoCanvasHeight)
    this.drawBackGround()
    this[grid](this.bodyCanvas, this.images)
  }
  [PhotoGrid.HORIZONTAL](bodyCanvas: BodyCanvas, images: WechatMiniprogram.MediaFile[]){
    const imageWidth = this.width
    const imageHeight = this.photoCanvasHeight / images.length
    this.loadPhotos(bodyCanvas, images, (i: number) => [imageWidth / 2, imageHeight / 2, imageWidth, imageHeight, 0,  this.offset + this.horizintalSpace + (imageHeight * i), imageWidth, imageHeight])
  }
  [PhotoGrid.VERTICAL](bodyCanvas: BodyCanvas, images: WechatMiniprogram.MediaFile[]) {
    const imageWidth = this.width! / images.length
    const imageHeight = this.photoCanvasHeight
    this.loadPhotos(bodyCanvas, images, (i: number) => [imageWidth / 2, imageHeight / 2, imageWidth, imageHeight, imageWidth * i, this.offset + this.horizintalSpace, imageWidth, imageHeight])
  }
  loadPhotos(bodyCanvas: BodyCanvas, images: WechatMiniprogram.MediaFile[], action: (num: number) => Tuple<number, 8>) {
    images.forEach((imgFile, i) => {
        
      //   const img = canvas!.createImage()
      //   img.src = imgFile.tempFilePath
      //   img.onload = () => {
      //     console.log('img.width', img.width)
      //     console.log('img.height', img.height)

      //     let [x, y, ...arr] = action(i)
      //     x = Math.abs(x - img.width / 2)
      //     y = Math.abs(y - img.height / 2)
      //     console.log(x, y)
      //     //@ts-ignore
      //     ctx!.drawImage(img, x, y, ...arr)
      // }
       //@ts-ignore
      this.photos.push(new Photo(bodyCanvas, imgFile.tempFilePath, action(i)))
    })
  }
  
  // preLoadPhotoSize(images: WechatMiniprogram.MediaFile[]) {
  //   let minWidth = Infinity, minHeight = Infinity
  //   images.forEach(i => {
  //     minWidth = Math.min(minWidth, i.width)
  //     minHeight = Math.min(minHeight, i.height)
  //   })
  //   return {
  //     minWidth,
  //     minHeight
  //   }
  // }
}