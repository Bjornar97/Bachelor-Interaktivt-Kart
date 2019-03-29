import * as geolocation from "nativescript-geolocation";
import { Location } from 'nativescript-geolocation';

export type LocationObject = {
  id: number;
  timestamp: Date;
  lat: number;
  lng: number;

  speed: number;
  direction: number;
  altitude: number;

  horizontalAccuracy: number;
  verticalAccuracy: number;
}


export class LocationClass {

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

  /**
   * newPoint() - make a new LocationObject.
   * 
   * @param timestamp Date of the point
   * @param lat latitude
   * @param lng longitude
   * @param horizontalAccuracy how accurate the point is horizontally
   * @param speed the speed at the point, optional
   * @param direction direction, e.g 0 for north, optional
   * @param altitude altitude of the point, optional
   * @param verticalAccuracy how accurate the point is vertically
   */
  public newPoint(timestamp: Date, lat: number, lng: number, horizontalAccuracy: number, speed?: number, direction?: number, altitude?: number, verticalAccuracy?: number) {
    console.log("Making new point");
    let location: LocationObject;
    location = {
      id: timestamp.valueOf(),
      timestamp: timestamp,
      lng: lng,
      lat: lat,
      horizontalAccuracy: horizontalAccuracy,
      speed: speed,
      altitude: altitude,
      direction: direction,
      verticalAccuracy: verticalAccuracy
    }
    return location; 
  }

  public getAccuracy(){
    
  }

  private static convertToGeoLocation(points: LocationObject[]): geolocation.Location[]{
    var newArray: Location[] = [];
    points.forEach(function(point){
      newArray.push({
        altitude: point.altitude,
        direction: point.direction,
        horizontalAccuracy: point.horizontalAccuracy,
        latitude: point.lat,
        longitude: point.lng,
        speed: point.speed,
        timestamp: point.timestamp,
        verticalAccuracy: point.verticalAccuracy
      })
    });
    return newArray;
  }

  /**
   * findDistance - Find the distance betweee two points.
   * 
   * @param firstPoint The first point. Type LocationObject
   * @param secondPoint The second point. Type LocationObject
   * 
   * @returns The distance in meters
   */
  public static findDistance(firstPoint: LocationObject, secondPoint: LocationObject) {
    var geoPoints = this.convertToGeoLocation([firstPoint, secondPoint]);
    var first = true;
    var firstP: Location;
    var secondP: Location;
    geoPoints.forEach((point) => {
      if (first){
        firstP = point;
        first = false;
      } else {
        secondP = point;
      }
    });
    return geolocation.distance(firstP, secondP);
  }

  /**
   * getLocation - get the current location of the device
   * 
   * @param accuracy if it is 1, it is using gps, about 3 metres, 0 is using wifi or cell towers and have lower accuracy(100-500 meters).
   *    Use "any" if you dont need the accuracy as it uses less power
   * 
   * @param maxAge How old the location can be in milliseconds. If maxAge = 5000, then you will get back a location that is less than 5 seconds old.
   * 
   * @param maxTimeout How long it can try to get the location before aborting in milliseconds.
   */
  public getLocation(maxAge = 5000, maxTimeout = 20000, accuracy = this.defaultAccuracy): Promise<LocationObject> {
    var newPoint = this.newPoint;
    return new Promise((resolve, reject) => {
      let getlocation = function(){
        geolocation.getCurrentLocation({desiredAccuracy: accuracy, maximumAge: maxAge, timeout: maxTimeout})
            .then(function (loc) {
              var point = newPoint(loc.timestamp, loc.latitude, loc.longitude, loc.horizontalAccuracy, loc.speed, loc.direction, loc.altitude, loc.verticalAccuracy);
              resolve(point);
              }, function (reason){
                console.error(reason);
                reject(new Error("Error while getting your location " + reason));
            });
          };
      geolocation.isEnabled().then((result) => {
        if (result){
          getlocation();
        } else {
          geolocation.enableLocationRequest(true, true).then(() => {
            getlocation();
          });
          console.log("Permission denied");
          // TODO: Show error-message to user
        }
      });
    }) 
  }

  
  ngOnInit() {
    geolocation.isEnabled().then((result) => {
      if (!result){
        console.log("Location not enabled, asking for permission");
        geolocation.enableLocationRequest();
      }
    });
  }

}
