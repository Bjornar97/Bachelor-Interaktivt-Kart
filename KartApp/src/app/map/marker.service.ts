import { Injectable, NgZone } from '@angular/core';
import * as fs from "tns-core-modules/file-system";
import { MapboxMarker } from 'nativescript-mapbox';
import { SettingsService } from '../settings-page/settings.service';
import * as globals from "../globals";
import { RouterExtensions } from 'nativescript-angular/router';

@Injectable({
  providedIn: 'root'
})
export class MarkerService {

  constructor(private settingsService: SettingsService) { 

  }

  getFolder(){
    return fs.knownFolders.documents().getFolder("Markers")
  }

  getInfoFile(){
    return this.getFolder().getFile("markersInfo.json");
  }

  getInfo(): {idsType: {id: number, type: string}[], lastID: number}{
    var file = this.getInfoFile();
    try {
      var info = JSON.parse(file.readTextSync());
      if (info == undefined){
        info = {
          idsType: [],
          lastID: 0
        }
      }
      return info; 
    } catch (error) {
      console.log("An error occured while getting info: " + error);
      info = {
        idsType: [],
        lastID: 0
      }
      return info;
    }

  }

  writeInfo(info){
    try {
      this.getInfoFile().writeText(JSON.stringify(info)); 
    } catch (error) {
      console.log("ERROR in writeInfo in markerService: " + error);
    }
  }

  private getLastId(){
    return this.getInfo().lastID;
  }

  private setLastId(id: number){
    var info = this.getInfo();
    info.lastID = id;
    this.writeInfo(info);
  }

  /**
   * saveMarker - Save a marker
   * 
   * @param marker The marker you want to save
   * @param type The type of the marker. Supported types: "image"
   */
  saveMarker(marker: MapboxMarker, type: string){
    var folder = this.getFolder();

    if (type == "image"){
      var imageFolder = folder.getFolder("images");
      var file = imageFolder.getFile("image" + marker.id);
      try {
        file.writeText(JSON.stringify(marker)); 
      } catch (error) {
        console.log("ERROR in saveMarker in markerService: " + error);
      }
    }
  }

  /**
   * makeMarker - Makes a new marker and saves it.
   * 
   * @param lat The latitude of the marker, has to be a number.
   * @param lng The longitude of the marker, has to be a number.
   * @param onTap Function to be called when tapped.
   * @param type The type of the marker. Supported types: "image"
   * @param iconPath If you want to show an image or icon, provide the url to it. Optional
   */
  makeMarker(lat: number, lng: number, url: string, type: string, iconPath?: string){
    var lastId: number = this.getLastId();
    var marker = <MapboxMarker>{
      id: lastId + 1,
      lat: lat,
      lng: lng,
      onTap: function(){
        // TODO: Open Drawer
        console.log("Tapped marker " + marker.id);
        globals.routerExtensions.navigateByUrl(url + marker.id);
      },
      icon: iconPath
    }
    this.setLastId(marker.id);
    this.saveMarker(marker, type);
    var info = this.getInfo();
    info.idsType.push({
      id: marker.id,
      type: type
    });
    console.dir(info);
    this.writeInfo(info);
    if (this.settingsService.getSetting(undefined, 2) != undefined){
      if (this.settingsService.getSetting(undefined, 2).value){
        console.log("Adding marker to the map");
        globals.MainMap.addMarkers([marker]);
      }
    } else {
      this.settingsService.setSetting({
        id: 2,
        name: "showImageMarkers",
        type: "switch",
        value: true
      });
      globals.MainMap.addMarkers([marker]);
    }
    return marker;
  }

  private getMarker(id: number){
    var file = this.getFolder().getFile("image" + id);
    try {
      var marker = JSON.parse(file.readTextSync());
      return marker;
    } catch (error) {
      console.log("ERROR in getMarker in markerService: " + error);
    }
  }
  /**
   * getMarkers - If type is not undefined, it will return all markers of that type. 
   * 
   * @param type The type of the marker, for example "image". 
   * @param ids The ids of the markers you want to get
   */
  getMarkers(type?: string, ids?: number[]){
    var markers = [];
    if (type != undefined){
      var info = this.getInfo();
      if (info != undefined){
        if (info.idsType != undefined){
          info.idsType.forEach((value) => {
            if (value.type == type){
              var marker = this.getMarker(value.id);
              markers.push(marker);
            }
          });
        }
      }
      return markers;
    } else if (ids != undefined){
      ids.forEach((id) => {
        markers.push(this.getMarker(id));
      });
      return markers;
    } else {
      console.log("ERROR in getMarkers in markerService: Neither Type nor ids were specified, and can therefore not return anything")
    }
  }
}
