import { PhotoGrid } from "./type";

export class PhotoManagement{
  constructor(canvas: any, ctx: any, images: any[], grid: PhotoGrid, width: number, height: number) {
    if(grid === PhotoGrid.HORIZONTAL) {
      const imageWidth = width / images.length
     
      images.forEach((imgFile, i) => {
        
        const img = canvas.createImage()
        img.src = imgFile.tempFilePath
       // TODO: 高度以最小的为主，然后都设为最小的高度
        img.onload = () => {
          const imageRatio = img.width / img.height
          const imageHeight = imageWidth / imageRatio
          const space = (height - imageHeight) / 2
          ctx.drawImage(img, imageWidth * i, space, imageWidth, imageHeight)
      }
    })
    }else{
      images.forEach((imgFile, i) => {
        const img = canvas.createImage()
        img.src = imgFile.tempFilePath
        img.onload = () => {
          const imageHeight = height / images.length
          ctx.drawImage(img, 0, imageHeight * i, width, imageHeight)
      }
    })
  }
  }
}