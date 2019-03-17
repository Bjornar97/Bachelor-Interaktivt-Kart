import { Injectable } from '@angular/core';
import * as globals from "../globals";
import { Trip, Tracker } from '../tracker';
import * as fs from 'tns-core-modules/file-system';
import { HomeModule } from "./home-page.module";
import { AppModule } from '../app.module';
import { LocationClass } from '../location';

@Injectable({
  providedIn: AppModule
})
export class TripService {

  constructor() {
    if (globals.MainTracker == undefined){
      globals.setTracker(new Tracker(1, true));
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
    var folder = this.getTripFolder();
    if (fs.File.exists(fs.path.join(folder.path, "Trip" + id + ".json"))){
      return true;
    } else {
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
      trip.startTime = new Date(trip.startTime);
      trip.stopTime = new Date(trip.stopTime);
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

  sortTrips(_trips: Trip[]){
    // Sortere etter startTime. f. eks: trip[x].startTime

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
    if (this.tracker.getStatus()){
      console.log("ERROR: Trip is already started");
      return new Error("En tur pågår allerede");
    } else {
      this.tracker.startTrip();
      var trip = this.tracker.getTrip();
      var file = this.getTripFolder().getFile("Info.json");
      var info;
      try {
        var value = file.readTextSync();
        info = JSON.parse(value);
        info.lastTripID = trip.id;
        file.writeTextSync(JSON.stringify(info));
        return trip.id;
      } catch (error) {
        console.log("ERROR in tripService(startTrip): " + error);
      }
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
    var trip = this.tracker.getTrip();
    var currentTripFile = this.getCurrentTripFile();
    var currentTrip = {
      tripID: this.tracker.getTripID(),
      trip: trip,
      tripTrips: this.tracker.getTripTrips(),
      totalTime: this.tracker.getTotalTime()
    }
    currentTripFile.writeTextSync(JSON.stringify(currentTrip));
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

  /**
   * endTrip() - End the current trip.
   * 
   * @returns The finished trip.
   */
  endTrip(): Trip{
    var trip = this.tracker.endTrip();
    this.getCurrentTripFile().removeSync();
    var file = this.makeTripFile(this.tracker.getTripID());
    file.writeTextSync(JSON.stringify(trip), (error) => {
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
    events: {
      timestamp: Date,
      type: string,
      value: any,
    }[]
  } {
    var trip = this.getTrip(id);
    var result = {
      events: []
    };
    if (trip != undefined){
      if (trip.pauses != undefined){

        var lastPoint: number;
        var first = true;
        var locationClass = new LocationClass();

        trip.pauses.forEach((pause) => {
          if (first){

            lastPoint = trip.points.findIndex(function(value): boolean {
              return value.id == pause.from.id;
            });

            var duration = new Date(pause.from.timestamp).getTime() - trip.startTime.getTime();
            var distance = 0;
            if (trip.points.length > 1){
              for (let i = 1; i < lastPoint; i++) {
                distance += locationClass.findDistance(trip.points[i-1], trip.points[i]);
              }
            }
            var walkEvent = {
              timestamp: trip.startTime,
              type: "walk",
              value: {
                duration: duration,
                AverageSpeed: distance / duration
              }
            }
            first = false;
          } else {
            var point = trip.points.findIndex(function(value): boolean {
              return value.id == pause.from.id;
            });
            var duration = new Date(pause.from.timestamp).getTime() - new Date(trip.points[lastPoint + 1].timestamp).getTime();
            var distance = 0;
            if (trip.points.length > 1){
              for (let i = 1; i < point; i++){
                distance += locationClass.findDistance(trip.points[i-1], trip.points[i]);
              }
            }

            var walkEvent = {
              timestamp: trip.points[lastPoint + 1].timestamp,
              type: "walk",
              value: {
                duration: duration,
                AverageSpeed: distance / duration
              }

            }
          }
          var event = {
            timestamp: pause.from.timestamp,
            type: "pause",
            value: {
              from: new Date(pause.from.timestamp),
              to: new Date(pause.to.timestamp)
            }
          }
          result.events.push(walkEvent, event);
        });
        if (trip.images != undefined){
          trip.images.forEach((image) => {
            // TODO: Legge til bildet her.
          });
        }
    
        // TODO: Sortere her
      }
    }
    

    return result;
  }

  /**
   * Get the total time the current trip has been going for. Does not include paused intervals.
   * 
   * @returns the total time in a string in this format: hh:mm:ss. If its less than one hour, this is returned: mm:ss
   */
  getTotalTime(){
    var trip = this.tracker.getTrip();
    var time;
    if (this.isPaused()){
      time = this.timeConversion(this.tracker.getTotalTime());
    } else {
      time = this.timeConversion(this.tracker.getTotalTime() + (Date.now() - trip.startTime.getTime()));
    }
    return time;
  }

  /**
   * getTripTime() - Get the total time from the provided trip
   * 
   * @param Trip The trip to analyze
   */
  getTripTime(Trip: Trip){
    var time: number;
    time = Trip.stopTime.getTime() - Trip.startTime.getTime();

    if (Trip.pauses != undefined){
      Trip.pauses.forEach(pause => {
        time -= new Date(pause.to.timestamp).getTime() - new Date(pause.from.timestamp).getTime();
      });
    }
    return time;
  }

  /**
   * timeConversion - Converts time in milliseconds to a readable string in this format: hh:mm:ss. If less than one hour: mm:ss
   * 
   * @param millisec The total time in milliseconds
   */
  public timeConversion(millisec) {
    var totalTime = millisec;

    var totalHours = Math.floor(totalTime / 3600000);
    var totalMinutes = Math.floor((totalTime % 3600000) / 60000);
    var totalSeconds = Math.floor((totalTime % 60000) / 1000);

    var hrs = (totalHours < 10) ? ("0" + totalHours) : totalHours;
    var min = (totalMinutes < 10) ? ("0" + totalMinutes) : totalMinutes;
    var sec = (totalSeconds < 10) ? ("0" + totalSeconds) : totalSeconds;
    
    if (totalHours < 1) {
        return min + ":" + sec;
    } else {
        return hrs + ":" + min + ":" + sec;
    }
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
