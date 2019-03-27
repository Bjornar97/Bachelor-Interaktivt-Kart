import { Injectable } from '@angular/core';
import * as globals from "../globals";
import { Trip, Tracker } from '../tracker';
import * as fs from 'tns-core-modules/file-system';
import { HomeModule } from "./home-page.module";
import { AppModule } from '../app.module';
import { LocationClass, LocationObject } from '../location';
import { Image } from 'tns-core-modules/ui/image/image';
import { ImageAsset } from 'tns-core-modules/image-asset/image-asset';
import { ImageService } from './image.service';
import { MarkerService } from '../map/marker.service';
import { RouterExtensions } from 'nativescript-angular/router';
import { MapboxMarker } from 'nativescript-mapbox';
import { start } from 'tns-core-modules/application/application';
import { SettingsService } from '../settings-page/settings.service';

@Injectable({
  providedIn: AppModule
})
export class TripService {

  constructor(private imageService: ImageService, private settingsService: SettingsService, private markerService: MarkerService, private routerExtensions: RouterExtensions) {
    if (globals.MainTracker == undefined){
      globals.setTracker(new Tracker(1));
    }
    this.tracker = globals.MainTracker;
  }

  private tracker: Tracker;

  /**
   * getTripFilder() - Gets the folder of the trips containing all trips and an info file.
   * 
   * @returns The folder containing the trips.
   */
  private getTripFolder(){
    var documents = fs.knownFolders.documents();
    return documents.getFolder("Trips");
  }

  /**
   * getTripFile - Get the file of the provided id if it exists
   * 
   * @param id The id of the trip
   * 
   * @returns The file of the trip. If it does not exist, nothing gets returned.
   */
  private getTripFile(id){
    var folder = this.getTripFolder();
    if (fs.File.exists(fs.path.join(folder.path, "Trip" + id + ".json"))){
      return this.getTripFolder().getFile("Trip" + id + ".json");
    } else {
      console.log("ERROR: tripService: The File for id: " + id + " does not exist");
      var infoFile = this.getTripFolder().getFile("Info.json");
      var info = JSON.parse(infoFile.readTextSync());
      var ids: number[] = info.ids;
      delete ids[ids.indexOf(id)];
      infoFile.writeTextSync(JSON.stringify(info));
    }
  }

  /**
   * makeTripFile() - Makes a new file for the trip with the provided id. 
   * 
   * @param id The id of the trip
   * 
   * @returns The file thats created.
   */
  private makeTripFile(id){
    var folder = this.getTripFolder();
    if (fs.File.exists(fs.path.join(folder.path, "Trip" + id + ".json"))){
      console.log("Tried to make file that already exist");

      // TODO: Add the id to the array and change the id in trip and make new file with the new id.

      return folder.getFile("Trip" + id + ".json");
    } else {
      return folder.getFile("Trip" + id + ".json");
    }
  }

  /**
   * getCurrentTrip() - Get the trip that is currently in progress
   * 
   * @returns The trip that is in progress. If there are none in progress, nothing gets returned
   */
  getCurrentTrip(): Trip{
    if (this.tracker.getStatus()){
      return this.tracker.getTrip();
    }
  }

  /**
   * doesTripExist() - Checks if there exist a trip with the provided id by checking if the file exist.
   * 
   * @param id The id of the trip
   * 
   * @returns true if the trip exist, false if not.
   */
  doesTripExist(id: number){
    try {
      var folder = this.getTripFolder();
      if (fs.File.exists(fs.path.join(folder.path, "Trip" + id + ".json"))){
        return true;
    } else {
      return false;
    }
    } catch (error) {
      console.log("Error: " + error);
      return false;
    }
  }

  /**
   * getTrip() - Get the trip from the filesystem
   * 
   * @param id The id of the trip
   * 
   * @returns The trip object
   */
  getTrip(id: number): Trip{
    try {
      var file = this.getTripFile(id);
      if (file != undefined){
        var tripText = file.readTextSync((error) => {
          console.log("ERROR: tripService: " + error);
        });
      }
      var trip: Trip = JSON.parse(tripText);
      return trip;
    } catch (error) {
      console.log("ERROR in tripService(getTrip): " + error);
      console.log("Cannot get trip :( " + id);
    }
  }

  deleteTrip(id: number[]){
    id.forEach((currentId) => {
      console.log("Deleting trip: " + currentId);
      if (this.doesTripExist(currentId)){
        this.getTripFile(currentId).remove();
      }
      try {
        var infoFile = this.getTripFolder().getFile("Info.json");
        var info = JSON.parse(infoFile.readTextSync());
        var ids: number[] = info.ids;
        delete ids[ids.indexOf(currentId)];
        infoFile.writeTextSync(JSON.stringify(info));
        if (fs.File.exists(fs.path.join(this.getTripFolder().path, "CurrentTrip.json"))){
          var currtrip: Trip = JSON.parse(this.getCurrentTripFile().readTextSync());
          if (currentId == currtrip.id){
            this.getCurrentTripFile().removeSync();
          }  
        }
      } catch (error) {
        console.log("ERROR in tripService(deleteTrip): " + error);
      }
    });
  }

  deleteFolder(){
    this.getTripFolder().removeSync();
    this.getCurrentTripFile().removeSync();
  }

  sortTrips(trips: Trip[]){
    // Sortere etter startTime. f. eks: trip[x].startTime
    return trips.sort((n1,n2) => {
    if (n1.startTime.getTime() > n2.startTime.getTime()) {
      return 1;
  }
    if (n1.startTime.getTime() < n2.startTime.getTime()) {
      return -1;
  }
      return 0;
   });
  }

  /**
   *  getTrips() - Get all finished trips from the json files.
   */
  getTrips(): Trip[]{
    try {
      var info = JSON.parse(this.getTripFolder().getFile("Info.json").readTextSync());
      if (info == undefined){
        info = {
          ids: [],
          lastTripID: 0
        }
      }
      var ids = info.ids;
      var trips: Trip[] = [];
      ids.forEach(id => {
        if (id != undefined){
          var trip: Trip = this.getTrip(id);
          if (trip != undefined){
            trips.push(trip);
          }
        }
      });
      // trips = sortTrips(trips);
      return trips;
    } catch (error) {
      console.log("ERROR in tripService(getTrips): " + error);
    }

  }

  /**
   * getLastTripId() - get the id of the last trip that was finished
   */
  getLastTripId(){
    var folder = this.getTripFolder();
    var info;
    if (fs.File.exists(fs.path.join(folder.path, "Info.json"))){
      var file = folder.getFile("Info.json");
      var value = file.readTextSync();
      console.log("Info: " + value);
      try {
        info = JSON.parse(value);
        return info.lastTripID;
      } catch (error) {
        console.log("ERROR in tripService(getLastTripId): " + error);
        return 0;
      }
    } else {
        var file = folder.getFile("Info.json");
        console.log("Could not find file");
        return 0;
    }
  }

  getCurrentTripFile(){
    return this.getTripFolder().getFile("CurrentTrip.json");
  }

  /**
   * startTrip - Start a new trip
   * 
   * @returns the id of the trip, or the error if one occures
   */
  startTrip(): number | Error{
    try {
      if (this.tracker.getStatus()){
        console.log("ERROR: Trip is already started");
        return new Error("En tur pågår allerede");
      } else {
        let id = this.getLastTripId() + 1;
        this.tracker.startTrip(id);
        var file = this.getTripFolder().getFile("Info.json");
        var info;
        try {
          var value = file.readTextSync();
          info = JSON.parse(value);
          info.lastTripID = id;
          file.writeTextSync(JSON.stringify(info));
          return id;
        } catch (error) {
          console.log("ERROR in tripService(startTrip): " + error);
        }
      }
    } catch (error) {
      this.tracker.reset();
      this.routerExtensions.navigate(["home"], {
        animated: true,
        clearHistory: true,
        transition: {
          name: "slideRight"
        }
      })
      console.log("ERROR in startTrip in tripService: " + error);
    }
  }


  saveCurrentTrip(){
    var trip = this.tracker.getTrip();
    let paused = this.tracker.isPaused();
    if (!paused){
      this.tracker.pauseTrip();
    }
    var currentTripFile = this.getCurrentTripFile();
    try {
      currentTripFile.writeTextSync(JSON.stringify({trip: trip, paused: paused}));
    } catch (error) {
      console.log("Error in pauseTrip while saving currentTrip to file: " + error);
    }
  }

  /**
   * pauseTrip() - Pause the trip that is going on if not already paused.
   */
  pauseTrip(){
    if (this.isPaused()){
      return;
    }
    this.tracker.pauseTrip();
    this.saveCurrentTrip();
  }

  /**
   * unpauseTrip() - Unpause the trip
   */
  unpauseTrip(){
    if (this.isPaused()){
      this.tracker.unpauseTrip();
    }
  }
  
  /**
   * isPaused() - check if the trip is paused
   * 
   * @returns true if trip is paused, false if not
   */
  isPaused(){
    return this.tracker.isPaused();
  }

  drawTrip(id: number){
    let trip = this.getTrip(id);
    trip.walks.forEach((walk) => {
      globals.MainMap.drawLine(walk.points, walk.startTime);
    });
    if (trip.distanceMeters > 50){
      let markerIds = [];
      let start = trip.startPoint;
      let markers: MapboxMarker[] = [];
      markers.push({
        id: start.timestamp,
        lat: start.lat,
        lng: start.lng,
        title: "Start",
        subtitle: globals.timeMaker(new Date(start.timestamp)),
        icon: "res://start_trip_marker"
      });
      markerIds.push(start.timestamp);
      let stop = trip.stopPoint;
  
      markers.push({
        id: stop.timestamp,
        lat: stop.lat,
        lng: stop.lng,
        title: "Stopp",
        subtitle: globals.timeMaker(new Date(stop.timestamp)),
        icon: "res://stop_trip_marker"
      });
      markerIds.push(stop.timestamp);
      
      if (trip.distanceMeters > 200){
        let lastWalk;
        trip.walks.forEach((walk) => {
          let currentWalk = walk;
          if (lastWalk != undefined){
            let currentPoint = walk.points.pop();
            markers.push({
              id: currentWalk.startTime,
              lat: currentPoint.lat,
              lng: currentPoint.lng,
              title: "Pause slutter",
              subtitle: globals.timeMaker(new Date(currentPoint.timestamp)),
              icon: "res://pause_marker"
            });
            markerIds.push(currentPoint.timestamp);
            markers.push({
              id: lastWalk.stopTime,
              lat: lastWalk.points.pop().lat,
              lng: lastWalk.points.pop().lng,
              title: "Pause begynner",
              subtitle: globals.timeMaker(new Date(lastWalk.points.pop().timestamp)),
              icon: "res://pause_continue_marker",
            });
            markerIds.push(lastWalk.stopTime);
            let markerIdSetting = this.settingsService.getSetting(undefined, 32);
            if (markerIdSetting == undefined){
              markerIdSetting = {
                id: 32,
                name: "TripMarkerIds",
                type: "markers",
                value: []
              }
            }
            markerIdSetting.value[trip.id] = markerIds;
            this.settingsService.setSetting(markerIdSetting);
          } else {
            lastWalk = currentWalk;
          }
        });
      }
    }
  }

  unDrawTrip(id: number){
    let trip = this.getTrip(id);
    let ids = [];
    trip.walks.forEach((walk) => {
      ids.push(walk.startTime);
    });
    globals.MainMap.removeLine(ids);

    let markerIdsSetting = this.settingsService.getSetting(undefined, 32);
    if (markerIdsSetting == undefined){
      markerIdsSetting = {
        id: 32,
        name: "TripMarkerIds",
        type: "markers",
        value: []
      }
      this.settingsService.setSetting(markerIdsSetting);
    } else {
      globals.MainMap.removeMarkers(markerIdsSetting.value[id]);
    }
  }

  /**
   * endTrip() - End the current trip.
   * 
   * @returns The finished trip.
   */
  endTrip(): Trip{
    try {
      this.getCurrentTripFile().removeSync();
      var trip = this.tracker.endTrip();
      if (trip.id == undefined){
        throw new Error("Trip is undefined!");
      }
      var file = this.makeTripFile(trip.id);
    } catch (error) {
      console.log("ERROR in TripService: " + error);
      this.tracker.reset();
    }
    try {
      var jsonTrip = JSON.stringify(trip);
    } catch (error) {
      console.log("An error occured while stringifying trip. " + error);
      
    }
    
    file.writeTextSync(jsonTrip, (error) => {
      console.log("ERROR: tripService: Error while writing trip to file: " + error);
    });
    var infoFile = this.getTripFolder().getFile("Info.json");
    var info;
    try {
      info = JSON.parse(infoFile.readTextSync());
      info.ids.push(trip.id);
      infoFile.writeTextSync(JSON.stringify(info));
      return trip;

    } catch (error) {
      console.log("ERROR in tripService(endTrip): " + error);
      info = {
        ids: [],
        lastTripID: 0
      }
      infoFile.writeTextSync(JSON.stringify(info));
      return trip;
    }
  }

  /**
   * getTripEvents - Get all events in a trip, including pauses, in between pauses and pictures taken on the trip. Pictures is not fully implemented yet.
   * 
   * @param id The id of the trip
   * 
   * @returns An object with an array of events. Type specifies which type of event it is. And the value is the value of the event. 
   */
  getTripEvents(id): {
      timestamp: number,
      type: string,
      value: any,
    }[] 
    {
    var trip = this.getTrip(id);
    var events = [];

    if (trip != undefined){
      if (trip.walks != undefined){
        let lastPauseEvent = null;
        trip.walks.forEach((walk) => {
          let lastPoint = null;
          let distance = 0;
          walk.points.forEach((point) => {
            if (lastPoint != null){
              distance += LocationClass.findDistance(lastPoint, point);
            }
            lastPoint = point;
          });

          let duration = (walk.stopTime - walk.startTime) / 60000;
          let walkEvent = {
            timestamp: walk.startTime,
            type: "walk",
            value: {
              distanceMeters: distance,
              startTime: walk.startTime,
              stopTime: walk.stopTime,
              avgSpeed: duration / (distance / 1000)
            }
          }

          let pauseEvent = {
            timestamp: walk.stopTime,
            type: "pause",
            value: {
              from: walk.stopTime,
              to: undefined
            }
          }

          if (lastPauseEvent != null){
            lastPauseEvent.value.to = walk.startTime;
          }

          lastPauseEvent = pauseEvent;
          events.push(lastPauseEvent);
          events.push(walkEvent);
        });

        if (trip.images != undefined){
          trip.images.forEach((image) => {
            if (image != null && image != undefined){
              let imageEvent = {
                timestamp: image.timestamp,
                type: "image",
                value: {
                  markerId: image.markerId,
                  imageSrc: image.imageSrc,
                }
              }
              events.push(imageEvent);
            }
          });
        }
        
        events.sort((eventA, eventB) => {
          if (eventA.timestamp > eventB.timestamp){
            return 1;
          } else if (eventB.timestamp > eventB.timestamp){
            return -1;
          } else {
            return 0;
          }
        });
        console.dir(events);
        return events;
      } else {
        console.log("There is no walks here!");
      }
    } else {
      console.log("The trip is not defined!!!");
    }
  }


  saveImage(image: ImageAsset, lat: number, lng: number, url: string, iconPath?: string){
    return new Promise((resolve, reject) => {
      if (this.isTrip()){
      try {
        let marker = this.markerService.makeMarker(lat, lng, url, "image", iconPath);
        this.imageService.saveImage(image, marker.id).then((path) => {
          this.tracker.addImage(marker.id, path);
          resolve();
        });
      } catch (error) {
        console.log("An error occured in saveImage in tripService: " + error);
      }
      } else {
        console.log("ERROR in saveImage in TripService: There is no trip going on");
      }
    });
  }

  /**
   * Get the total time the current trip has been going for. Does not include paused intervals.
   * 
   * @returns the total time in a string in this format: hh:mm:ss. If its less than one hour, this is returned: mm:ss
   */
  getTotalTimeString(){
    return this.tracker.getTotalTimeString();
  }

  /**
   * isTrip() - Checks if there is a trip currently in progress
   * 
   * @returns true if a trip is in progress, false if not. A paused trip will return true.
   */
  isTrip(){
    if (this.tracker.getStatus()){
      return true;
    } else {
      return false;
    }
  }
}
