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

  private getLastId(){
    var file = fs.knownFolders.documents().getFolder("images").getFile("imagesInfo");
    var info;
    try {
      info = JSON.parse(file.readTextSync());
      if (info != undefined){
        if (info.lastID != undefined){
          return info.lastID;
        } else {
          return 0;
        }
      } else {
        return 0;
      }
    } catch (error) {
      console.log("Error in getLastId in imageService: " + error);
      return 0;
    }
  }

  private setLastId(id: number){
    var file = fs.knownFolders.documents().getFolder("images").getFile("imagesInfo");
    try {
      var info = JSON.parse(file.readTextSync());
      if (info != undefined){
        info.ids.push(id);
        info.lastID = id;
      } else {
        info = {
          ids: [id],
          lastID: id
        }
      }
    } catch (error) {
      console.log("Error while setting last id: " + error);
      info = {
        ids: [id],
        lastID: id
      }
    }

    file.writeText(JSON.stringify(info));
  }

  getImageSrc(id: number){
    return this.getPath(id);
  }

  saveImage(image: ImageAsset){
    var lastID = this.getLastId();
    let id = lastID + 1;
    var path = this.getPath(id);
    const source = new ImageSource();
    source.fromAsset(image).then((imageSource: ImageSource) => {
        const saved: boolean = imageSource.saveToFile(path, "png");
        if (saved){
          console.log("Saved image " + (id) + "to file at: " + path);
        }
      });
    this.setLastId(id);
    return path;
  }
}
