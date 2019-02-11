import { LocationClass, LocationObject } from "./location";
import * as geolocation from "nativescript-geolocation";
import { MainMap } from "./globals";

export type Trip = {
    id: number,
    points: LocationObject[],
    startTime: Date,
    stopTime: Date,
    title?: string,
    description?: string
  }

export class Tracker {
    constructor(defaultAccuracy: number) {
        this.accuracy = defaultAccuracy;
        this.locationClass = new LocationClass();
    }
    private accuracy: number;
    private locationClass: LocationClass;

    private status: boolean = false;
    private trip: Trip;

    private drawOnMap: boolean = false;
    private polyLines: number[] = [];

    /**
     * setDrawOnMap - Should it be drawn on the main map as you go?
     * 
     * @param value Set it to true to enable drawing on the map as you go along, set to false to disable it.
     */
    public setDrawOnMap(value: boolean){
        this.drawOnMap = value;
        if (value === true){
            var _this = this;
            MainMap.drawLine(this.trip.points).then(function(id){
                _this.polyLines.push(id);
            });
            this.polyLines.push();
        } else if (value === false){
            MainMap.removeLine(this.polyLines);
        }
    }

    public setAccuracy(newAccuracy: number){
        this.accuracy = newAccuracy;
    }

    private logPoint(point){
        console.log("Logging point " + point.timestamp.valueOf());
        var location: LocationObject = {
          id: point.timestamp.valueOf(),
          altitude: point.altitude,
          direction: point.direction,
          horizontalAccuracy: point.horizontalAccuracy,
          lat: point.lat,
          lng: point.lng,
          speed: point.speed,
          timestamp: point.timestamp,
          verticalAccuracy: point.verticalAccuracy
        }
        this.trip.points[location.id] = location;
        var i = 0;
        console.log("Added point");

        if (this.drawOnMap){
            MainMap.drawLine([point]);
        }
    }

    private logError(error: Error){
        console.log("Error while tracking " + error.message);
        console.dir(error.stack);
    }

    /**
     * startTrip - Start the tracking
     */
    public startTrip() {
        if (this.getStatus() == true){
            console.log("There is already a trip ongoing!");
            return new Error("There is alredy a trip ongoing!");
        }

        var _this = this;
        console.log("Logging location");
        var tripID = geolocation.watchLocation(function(point){
            console.log("New movement with accuracy " + _this.accuracy);
            _this.logPoint(point);
            }, function(error){
            _this.logError(error);
            }, 
            {
                desiredAccuracy: this.accuracy, 
                timeout: 10000, 
                maximumAge: 5000, 
                updateDistance: 10, 
                iosAllowsBackgroundLocationUpdates: true,
                iosPausesLocationUpdatesAutomatically: false
        });

        this.trip = {
            id: tripID,
            points: [],
            startTime: new Date(),
            stopTime: undefined
        }

        console.log("Started logging of " + tripID);
        //   this.trips[tripID] = {
        //     id: tripID,
        //     points: [],
        //     startTime: new Date(),
        //     stopTime: null,
        //     title: "Test",
        //     description: "This is a test"
        //   };
        console.log("Initiated trip");
        this.status = true;
    }

    public endTrip(): Trip{
        console.log("Stopping Trip " + this.trip.id);
        geolocation.clearWatch(this.trip.id);
        this.status = false;
        this.trip.stopTime = new Date();

        return this.trip;
    }

    /**
     * getTrip - Get the trip as it is now.
     */
    public getTrip(){
        return this.trip;
    }

    public getStatus(){
        if (this.status === false){
            return false;
        } else if (typeof this.trip.stopTime == undefined){
            return new Error("Something is not right. Status is false but does not have a stop time!");
        } else {
            return true;
        }
    }

}