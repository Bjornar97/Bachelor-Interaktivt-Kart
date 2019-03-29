import { LocationClass, LocationObject } from "./location";
import * as geolocation from "nativescript-geolocation";
import { MainMap } from "./globals";
import { TripService } from "./home-page/trip.service";
import { ImageService } from "./home-page/image.service";
import * as globals from "~/app/globals";

export type Trip = {
    id: number,
    startTime: number,
    stopTime: number,
    walks: {
        points: LocationObject[],
        startTime: number,
        stopTime: number
    }[]
    title?: string,
    description?: string,
    images?: {
        timestamp: number,
        markerId: number,
        imageSrc: string
    }[],
    distanceMeters: number,
    duration: number
}

type subTrip = {
    watchId: number,
    points: LocationObject[],
    startTime: number,
    stopTime?: number
}

export class Tracker {
    constructor(defaultAccuracy: number) {
        this.accuracy = defaultAccuracy;
        this.locationClass = new LocationClass();
    }
    private accuracy: number;
    private locationClass: LocationClass;

    private status: boolean = false;
    private subTrip: subTrip;
    private tripID: number;
    private lastAccuracy: number;

    // An array of all the "trips" in this trip. Every time you pause and unpause the trip, a new "trip" is created and added to this
    private Trip: Trip;
    private lastPoint: LocationObject;
    private paused: boolean;

    public gpsSignalStrength = 0;

    public totalTimeString: string = "00:00";

    public getTripID(){
        return this.tripID;
    }

    public loadTrip(trip: Trip){
        this.tripID = trip.id;
        this.Trip = trip;
        this.paused = true;
        this.status = true;
        this.totalTimeString = this.getTotalTimeString();
    }

    public setAccuracy(newAccuracy: number){
        this.accuracy = newAccuracy;
    }

    public addImage(markerId: number, imageUrl: string){
        var imageObject = {
            timestamp: new Date().getTime(),
            markerId: markerId,
            imageSrc: imageUrl
        }
        if (this.Trip.images == undefined) {
            this.Trip.images = [];
        }
        this.Trip.images.push(imageObject);
    }

    private logPoint(point: geolocation.Location, force: boolean = false){
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
        if (location.horizontalAccuracy > 50){
            this.gpsSignalStrength = 0;
        } else if (location.horizontalAccuracy > 20){
            this.gpsSignalStrength = 1;
        } else if (location.horizontalAccuracy > 10){
            this.gpsSignalStrength = 2;
        } else {
            this.gpsSignalStrength = 3;
        }
        if (this.lastPoint != undefined){
            if (LocationClass.findDistance(this.lastPoint, location) < this.lastAccuracy && !force) {
                if (location.horizontalAccuracy < this.lastAccuracy) {
                    this.subTrip.points.pop();
                    this.subTrip.points.push(location);
                    this.lastAccuracy = location.horizontalAccuracy;
                    this.lastPoint = location;
                }
            } else if (this.gpsSignalStrength > 0){
                this.subTrip.points.push(location);
                this.lastPoint = location;
                this.lastAccuracy = location.horizontalAccuracy;
            }
        } else if (this.gpsSignalStrength > 0){
            this.subTrip.points.push(location);
            this.lastPoint = location;
            this.lastAccuracy = location.horizontalAccuracy;
        }
        console.log("Added point");
    }

    private logError(error: Error){
        console.log("Error while tracking " + error.message);
        console.dir(error.stack);
    }

    /**
     * startTrip - Start the tracking
     */
    public startTrip(id: number) {
        if (this.getStatus() == true){
            console.log("There is already a trip ongoing!");
        }
        
        this.Trip = {
            id: id,
            distanceMeters: 0,
            startTime: new Date().getTime(),
            stopTime: undefined,
            walks: [],
            duration: 0
        }

        console.log("Logging location");
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

        this.subTrip = {
            watchId: watchID,
            points: [],
            startTime: new Date().getTime(),
        }
        this.startInterval();
        console.log("Started logging of " + watchID);
        this.tripID =  id;
        this.status = true;
        this.paused = false;
    }

    private pausing: boolean = false;

    public pauseTrip(){
        console.log("Pausing in tracker");
        if (this.paused){
            console.log("Already paused");
        }
        if (this.pausing) {
            console.log("Trying to pause while pauing");
            return;
        }
        this.pausing = true;
        this.pauseInterval();
        this.subTrip.stopTime = new Date().getTime();
        this.Trip.duration += this.subTrip.stopTime - this.subTrip.startTime;
        let prevPoint = null;
        this.subTrip.points.forEach((point) => {
            if (prevPoint != null) {
                this.Trip.distanceMeters += LocationClass.findDistance(prevPoint, point);
            }
            prevPoint = point;
        });
        geolocation.clearWatch(this.subTrip.watchId);
        this.locationClass.getLocation().then((loc) => {
            this.logPoint({
                altitude: loc.altitude,
                direction: loc.direction,
                horizontalAccuracy: loc.horizontalAccuracy,
                latitude: loc.lat,
                longitude: loc.lng,
                speed: loc.speed,
                timestamp: loc.timestamp,
                verticalAccuracy: loc.verticalAccuracy
            }, true);

            this.Trip.walks.push({
                points: this.subTrip.points,
                startTime: this.subTrip.startTime,
                stopTime: new Date().getTime()
            });

            this.paused = true;
            this.pausing = false;
        });
    }

    public unpauseTrip(){
        this.paused = false;
        console.log("Unpausing trip in tracker");
        var watchID = geolocation.watchLocation((point) => {
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
        
        var newSubTrip: subTrip = {
            startTime: new Date().getTime(),
            watchId: watchID,
            points: [],
            stopTime: undefined
        }
        this.subTrip = newSubTrip;

        this.startInterval();
        return this.Trip.duration;
    }

    /**
     * endTrip - Stops the trip and returns the finished trip.
     */
    public endTrip(): Trip{
        console.log("Stopping Trip " + this.tripID);
        this.pauseTrip();
        this.pauseInterval();
        this.subTrip.stopTime = new Date().getTime();
        this.Trip.stopTime = this.subTrip.stopTime;
        this.status = false;
        console.log("Finished ending of trip");
        return this.Trip;
    }

    private interval;

    private startInterval(){
        this.totalTimeString = this.getTotalTimeString();
        this.interval = setInterval(() => {
          this.totalTimeString = this.getTotalTimeString();
        }, 1000);
    }
    
    /**
     * pauseInterval() - Stop the interval, because then the trip is paused, there is no need for updating the timer.
     */
    private pauseInterval(){
    clearInterval(this.interval);
    }
    

    /**
     * getTrip - Get the trip as it is AFTER the last pause
     */
    public getTrip(){
        return this.Trip;
    }

    getDuration(){
        return this.Trip.duration;
    }

    getTotalTimeString(){
        var time;
        if (this.isPaused()){
          time = globals.timeConversion(this.Trip.duration);
        } else {
          time = globals.timeConversion(this.Trip.duration + (new Date().getTime() - this.subTrip.startTime));
        }
        console.log(time);
        return time;
      }

    public getStatus(){
        if (this.status === false){
            return false;
        } else if (typeof this.Trip.stopTime == undefined){
            return new Error("Something is not right. Status is false but does not have a stop time!");
        } else {
            return true;
        }
    }

    public isPaused(){
        return this.paused || this.pausing;
    }
}