import { Injectable } from '@angular/core';
import { Image } from 'tns-core-modules/ui/image/image';
import * as fs from "tns-core-modules/file-system";
import { ImageAsset } from 'tns-core-modules/image-asset/image-asset';
import { ImageSource } from 'tns-core-modules/image-source/image-source';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor() { 

  }

  private getPath(id: number): string{
    var folder = fs.knownFolders.documents().getFolder("images");
    return fs.path.join(folder.path, "image" + id + ".png");
  }

  getImageSrc(id: number){
    return this.getPath(id);
  }

  saveImage(image: ImageAsset, id: number): Promise<string>{
    var path = this.getPath(id);
    const source = new ImageSource();
    return new Promise(function(resolve, reject){
      source.fromAsset(image).then((imageSource: ImageSource) => {
        const saved: boolean = imageSource.saveToFile(path, "png");
        if (saved){
          resolve(path);
        } else {
          reject(new Error("The image was not saved"));
        }
      });
    });
  }
}
