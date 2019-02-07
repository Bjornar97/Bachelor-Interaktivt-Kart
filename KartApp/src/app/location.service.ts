import { Injectable } from '@angular/core';
import * as geolocation from "nativescript-geolocation";

type LocationObject = {
  timestamp: number;
  latitude: number;
  longitude: number;

  speed?: number;
  direction?: number;
  altitude?: number;

  horizontalAccuracy: number;
  verticalAccuracy?: number;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor(defaultAccuracy: number = 1) { 
    this.defaultAccuracy = defaultAccuracy;
  }

  private defaultAccuracy: number;

  private locationEnabled() {
    geolocation.isEnabled().then(function(isEnabled){
      if (!isEnabled){
        geolocation.enableLocationRequest().then(function () {
          return true;
        }, function (e){
          console.log("App: Error: " + (e.message || e));
          return false;
        })
      } else{
        return true;
      }
    }, function (e){
      console.log("App: Error: " + (e.message || e));
      return false;
    })
    return true;
  }

  private newPoint(timestamp, latitude, longitude, horizontalAccuracy, speed?, direction?, altitude?, verticalAccuracy?) {
    console.log("Making new point");
    let location: LocationObject;
    location = {
      timestamp: timestamp,
      longitude: longitude,
      latitude: latitude,
      horizontalAccuracy: horizontalAccuracy,
    }

    if (speed != undefined){
      location.speed = speed;
    }
    if (altitude != undefined){
      location.altitude = altitude;
    }
    if (direction != undefined){
      location.direction = direction;
    }
    if (verticalAccuracy != undefined){
      location.verticalAccuracy = verticalAccuracy;
    }
    return location; 
  }

  /**
   * getLocation
   * accuracy: "high" is using gps, about 3 metres, "any" is using wifi or cell towers and have lower accuracy.
   *    Use "any" if you dont need the accuracy as it uses less power
   * maxAge: How old the location can be in milliseconds. If maxAge = 5000, then you will get back a location that is less than 5 seconds old.
   * maxTimeout: How long it can try to get the location before aborting.
   */
  public async getLocation(maxAge = 5000, maxTimeout = 20000, accuracy = this.defaultAccuracy): Promise<any> {
    var newPoint = this.newPoint;

    return new Promise((resolve, reject) => {
      if(!this.locationEnabled()){
        reject(new Error("Location not enabled"));
      }

      var location = geolocation.getCurrentLocation({desiredAccuracy: accuracy, maximumAge: maxAge, timeout: maxTimeout})
        .then(function (loc) {
          var point = newPoint(loc.timestamp, loc.latitude, loc.longitude, loc.horizontalAccuracy, loc.speed, loc.direction, loc.altitude, loc.verticalAccuracy);
          resolve(point);
      }, function (reason){
            reject(new Error("Error while getting your location " + reason))
      });
    }) 
  }
}
