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
  top: number;
  constructor(bodyCanvas: BodyCanvas, images: WechatMiniprogram.MediaFile[], grid: PhotoGrid, offset: number) {
    let { width, height } = bodyCanvas
    this.bodyCanvas = bodyCanvas
    this.images = images
    this.width = width! - offset
    this.top = offset
    this.horizintalSpace = (height - offset) * 0.25
    this.photoCanvasHeight = this.horizintalSpace * 2
    this.offset = offset
    this.position = {x: 0, y: offset + this.horizintalSpace}
    this.bodyCanvas.addItem({draw: this.drawBackGround})

    this.drawBackGround()
    this[grid](bodyCanvas, images)

    this.grid = grid

    eventEmitter.emit(Event.AddImage, images)
    eventEmitter.on(Event.TogglerRulerSwicth, this.handleRuleHide)
  }

  handleRuleHide = (rulerSwitch: boolean) => {
    let { width, height } = this.bodyCanvas
    if(rulerSwitch) {
      this.width = width - this.offset
      this.horizintalSpace = (height - this.offset) * 0.25
      this.top = this.offset
    }else{
      this.width = width
      this.horizintalSpace = height * 0.25
      this.top = 0
    }
    this[this.grid](this.bodyCanvas, this.images)
    this.bodyCanvas.redraw()
  }

  drawBackGround = () => {
    const { ctx, height } = this.bodyCanvas
    // @ts-ignore
    // ctx!.fillStyle = this.bodyCanvas.getPattern();
    ctx!.fillStyle = '#F5F5F5'
    ctx!.fillRect(0, this.top, this.width, height);
  }
 
  changeGrid(grid: PhotoGrid) {
    if(this.grid === grid)return
    this.grid = grid
    this[this.grid](this.bodyCanvas, this.images)
    this.bodyCanvas.redraw()
  }
  [PhotoGrid.HORIZONTAL](bodyCanvas: BodyCanvas, images: WechatMiniprogram.MediaFile[]){
    const imageWidth = this.width
    const imageHeight = this.photoCanvasHeight / images.length
    const action:(num: number) => Tuple<number, 8>  = (i: number) => [imageWidth / 2, imageHeight / 2, imageWidth, imageHeight, 0,  this.top + this.horizintalSpace + (imageHeight * i), imageWidth, imageHeight]
    if(this.photos.length === 0) {
      this.loadPhotos(bodyCanvas, images, action)
    }else{
      this.changePhotosPosition(action)
    }
   
  }
  [PhotoGrid.VERTICAL](bodyCanvas: BodyCanvas, images: WechatMiniprogram.MediaFile[]) {
    const imageWidth = this.width! / images.length
    const imageHeight = this.photoCanvasHeight
    const action:(num: number) => Tuple<number, 8>  = (i: number) => [imageWidth / 2, imageHeight / 2, imageWidth, imageHeight, imageWidth * i, this.top + this.horizintalSpace, imageWidth, imageHeight]
    if(this.photos.length === 0) {
      this.loadPhotos(bodyCanvas, images, action)
    }else{
      this.changePhotosPosition(action)
    }
  }
  changePhotosPosition(action: (num: number) => Tuple<number, 8>) {
    this.photos.forEach((p, i) => {
      p.setPhotoPositionAndSize(action(i))
    })
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