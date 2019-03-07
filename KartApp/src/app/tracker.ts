import { LocationClass, LocationObject } from "./location";
import * as geolocation from "nativescript-geolocation";
import { MainMap } from "./globals";
import { TripService } from "./home-page/trip.service";

export type Trip = {
    id: number,
    watchId: number,
    points: LocationObject[],
    finished: boolean,
    startTime: Date,
    pauses?: {
        from: Date,
        to: Date
    }[]
    stopTime: Date,
    title?: string,
    description?: string
}

export class Tracker {
    constructor(defaultAccuracy: number, drawOnMap: boolean) {
        this.accuracy = defaultAccuracy;
        this.locationClass = new LocationClass();
        this.drawOnMap = drawOnMap;
    }
    private accuracy: number;
    private locationClass: LocationClass;

    private lastPoint: LocationObject;
    private status: boolean = false;
    private trip: Trip;
    private tripID: number;

    // An array of all the "trips" in this trip. Every time you pause and unpause the trip, a new "trip" is created and added to this
    private tripTrips: Trip[];
    private paused: boolean;
    private totalTime: number = 0;

    private drawOnMap: boolean = false;
    private polyLines: number[] = [];

    public getTripTrips(){
        return this.tripTrips;
    }

    public getTripID(){
        return this.tripID;
    }

    public loadTrip(tripID: number, trip: Trip, tripTrips: Trip[], totalTime: number){
        trip.startTime = new Date(trip.startTime);
        trip.stopTime = new Date(trip.stopTime);
        this.trip = trip;
        this.tripID = tripID;
        this.tripTrips = tripTrips;
        this.totalTime = totalTime;
        this.paused = true;
        this.status = true;
    }

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
          lat: point.latitude,
          lng: point.longitude,
          speed: point.speed,
          timestamp: point.timestamp,
          verticalAccuracy: point.verticalAccuracy
        }
        this.trip.points.push(location);
        var i = 0;
        console.log("Added point");

        this.lastPoint = point;
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
        var watchID = geolocation.watchLocation(function(point){
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
                updateTime: 5000,
                iosAllowsBackgroundLocationUpdates: true, // Skift tilbake når background mode er implementert
                iosPausesLocationUpdatesAutomatically: false
        });

        var tripservice = new TripService();
        var lastID = tripservice.getLastTripId();

        this.trip = {
            id: lastID + 1,
            watchId: watchID,
            points: [],
            finished: false,
            startTime: new Date(),
            stopTime: undefined
        }

        console.log("Started logging of " + watchID);
        this.totalTime = 0;
        this.tripID = this.trip.id;
        this.status = true;
        this.paused = false;
        this.tripTrips = [];
    }

    public pauseTrip(){
        console.log("Pausing in tracker");
        this.trip.stopTime = new Date();
        this.paused = true;
        this.totalTime += this.trip.stopTime.getTime() - this.trip.startTime.getTime();
        geolocation.clearWatch(this.trip.watchId);
    }

    public unpauseTrip(){
        console.log("Unpausing trip in tracker");
        var watchID = geolocation.watchLocation((point) => {
            console.log("New movement with accuracy " + this.accuracy);
            this.logPoint(point);
            }, (error) => {
            this.logError(error);
            }, 
            {
                desiredAccuracy: this.accuracy, 
                timeout: 10000, 
                maximumAge: 5000, 
                updateDistance: 10, 
                updateTime: 5000,
                iosAllowsBackgroundLocationUpdates: true,
                iosPausesLocationUpdatesAutomatically: false
        });


        var newTrip: Trip = {
            startTime: new Date(),
            id: this.trip.id + 1,
            watchId: watchID,
            finished: false,
            points: [],
            stopTime: undefined
        }
        this.tripTrips[this.trip.id] = this.trip;
        this.trip = newTrip;
        this.paused = false;
        return this.totalTime;
    }

    public endTrip(): Trip{
        console.log("Stopping Trip " + this.trip.id);
        geolocation.clearWatch(this.trip.watchId);
        this.trip.stopTime = new Date();
        this.tripTrips.push(this.trip);
        var finalTrip = this.processTrip();
        this.status = false;
        console.log("Finished ending of trip");
        return finalTrip;
    }

    private processTrip(){
        console.log("Processing trip");
        var finalTrip: Trip;
        var first = true;
        var prev: Trip;
        try {
            this.tripTrips.forEach((trip) => {
                if (trip != null){
                    if (first){
                        console.log("First trip");
                        finalTrip = {
                            id: this.tripID,
                            watchId: undefined,
                            finished: true,
                            pauses: [],
                            points: trip.points,
                            startTime: trip.startTime,
                            stopTime: undefined,
                        }
                        first = false;
                    } else {
                        console.log("Not first trip");
                        finalTrip.pauses.push({
                            from: prev.stopTime,
                            to: trip.startTime
                        });
                        trip.points.forEach((point) => {
                            finalTrip.points.push(point);
                        });
                    }
                    prev = trip;   
                } else {
                    console.log("Trip was null, skipping");
                }
            });
            finalTrip.stopTime = this.tripTrips.pop().stopTime;
        } catch (error) {
            console.log("There was an error while processing the trip");
            console.log(error);
            return;
        }
        
        console.log("Finished processing!");
        return finalTrip;
    }

    /**
     * getTrip - Get the trip as it is AFTER the last pause
     */
    public getTrip(){
        return this.trip;
    }

    public getTotalTime(){
        return this.totalTime;
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

    public isPaused(){
        return this.paused;
    }

}