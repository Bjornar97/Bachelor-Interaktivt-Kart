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
    return fs.knownFolders.documents().getFolder("Markers");
  }

  getInfoFile(){
    return this.getFolder().getFile("markersInfo.json");
  }

  getInfo(): {idsType: {id: number, type: string}[], lastID: number}{
    let file = this.getInfoFile();
    let info;
    try {
      info = JSON.parse(file.readTextSync());
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

  deleteMarker(id: number){
    let file = this.getInfoFile();
    try {
      let info: {idsType: {type: string, id: number}[]} = JSON.parse(file.readTextSync());
      let newInfo = info.idsType.filter((value) => {
        return value.id != id;
      });
      this.writeInfo(newInfo);
    } catch (error) {
      console.log("ERROR while deleting marker: " + error);
    }
  }

  private writeInfo(info){
    try {
      this.getInfoFile().writeText(JSON.stringify(info)); 
    } catch (error) {
      console.log("ERROR in writeInfo in markerService: " + error);
    }
  }

  /**
   * saveMarker - Save a marker
   * 
   * @param marker The marker you want to save
   * @param type The type of the marker. Supported types: "image"
   */
  saveMarker(marker: MapboxMarker, type: string, url: string){
    let folder = this.getFolder()
    let file = folder.getFile("marker" + marker.id + ".json");
    try {
      let markerObject = {
        id: marker.id,
        lat: marker.lat,
        lng: marker.lng,
        icon: marker.icon,
        path: url,
        type: type
      }
      file.writeText(JSON.stringify(markerObject));
    } catch (error) {
      console.log("ERROR in saveMarker in markerService: " + error);
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
    let info = this.getInfo();
    let id = info.lastID + 1;
    var marker = <MapboxMarker>{
      id: id,
      lat: lat,
      lng: lng,
      onTap: function(){
        // TODO: Open Drawer
        console.log("Tapped marker " + id);
        globals.routerExtensions.navigateByUrl(url + id);
      },
      icon: iconPath
    }
    this.saveMarker(marker, type, url);
    info.idsType.push({
      id: id,
      type: type
    });
    info.lastID = id;
    this.writeInfo(info);
    if (this.settingsService.getSetting(undefined, 2) != undefined && type == "image"){
      if (this.settingsService.getSetting(undefined, 2).value){
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

  private getMarker(id: number): MapboxMarker{
    let file = this.getFolder().getFile("marker" + id + ".json");
    try {
      let markerObject = JSON.parse(file.readTextSync());
      let marker = <MapboxMarker>{
        id: markerObject.id,
        lat: markerObject.lat,
        lng: markerObject.lng,
        icon: markerObject.icon,
        onTap: function(){
          console.log("Tapped marker " + id);
          globals.routerExtensions.navigateByUrl(markerObject.url + id);
        }
      }
      return marker;
    } catch (error) {
      console.log("ERROR in getMarker in markerService: " + error);
      file.remove();
      this.deleteMarker(id);
    }
  }
  /**
   * getMarkers - If type is not undefined, it will return all markers of that type. 
   * 
   * @param type The type of the marker, for example "image". 
   * @param ids The ids of the markers you want to get
   */
  getMarkers(type?: string, ids?: number[]): MapboxMarker[]{
    let markers = [];
    if (type != undefined){
      let info = this.getInfo();
      if (info != undefined){
        if (info.idsType != undefined){
          info.idsType.forEach((value) => {
            if (value.type == type){
              let marker = this.getMarker(value.id);
              if (marker != undefined){
                markers.push(marker);
              } else {
                this.deleteMarker(value.id);
              }
            }
          });
        } else {
          console.log("idsType is not defined!");
        }
      }
      return markers;
    } else if (ids != undefined){
      ids.forEach((id) => {
        markers.push(this.getMarker(id));
      });
      return markers;
    } else {
      console.log("ERROR in getMarkers in markerService: Neither Type nor ids were specified, and can therefore not return anything");
    }
  }
}
