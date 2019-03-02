import { Component, OnInit, Input } from '@angular/core';
import { MapboxViewApi, MapboxMarker, Viewport as MapboxViewport, LatLng, latitudeProperty } from "nativescript-mapbox";
import { LocationClass, LocationObject } from "../location";
import * as globals from "../globals";
import { SettingsService, Setting } from '../settings-page/settings.service';

@Component({
  selector: 'ns-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  moduleId: module.id,
})
export class MapComponent implements OnInit {

    private styles = [
        {
            id: 0,
            name: "satellite",
            value: "mapbox://styles/mapbox/satellite-streets-v9"
        },
        {
            id: 1,
            name: "outdoors",
            value: "mapbox://styles/mapbox/outdoors-v10"
        },
        {
            id: 2,
            name: "street",
            value: ""
        }
    ]
    
    constructor(){
        this.locationClass = new LocationClass(1);
        this.settingsService = globals.settingsService;
    }
    
    private settingsService: SettingsService;
    private settings: Setting[];
    private autoRotate = true;

    @Input() main: string;
    private locationClass: LocationClass;
    private map: MapboxViewApi;
    private mapStyles = {
        mapStyle: "mapbox://styles/mapbox/outdoors-v10",
        latitude: 64.810928,
        longitude: 15.605580,
        zoomLevel: 3,
        showUser: true,
        disableMovement: false
    }

    setAutoRotate(value: boolean){
        this.autoRotate = value;
    }

    /**
     * setCenter - Set the center of the map
     * 
     * @param latitude 
     * @param longitude 
     * @param animated Should the transition be animated, true or false
     */
    public setCenter(latitude, longitude, animated = true){
        this.map.setCenter({lat: latitude, lng: longitude, animated: animated});
    }

    /**
     * addMarkers
     * @param markers
     */
    public addMarkers(markers: MapboxMarker[]) {
        this.map.addMarkers(markers);
    }

    /**
     * 
     * @param points An array of points the line should go between. The points need to be in type LatLng with latitude and longitude.
     * @param color The color of the line.  default: red.
     * @param width The width of the line. default: 1.
     * @param opacity The opacity of the line. Default: 0.7.
     */
    public drawLine(points: LatLng[], color = "#ff0000", width = 1, opacity = 0.7){
        // var LatLngPoints: LatLng[] = [];
        // points.forEach(function(point){
        //     LatLngPoints.push({
        //         lat: point.lat,
        //         lng: point.lng
        //     });
        // });
        var promise = this.map.addPolyline({color: color, points: points, width: width, opacity: opacity});
        return promise;
    }

    /**
     * 
     * @param ids Array of ids you want to remove from the map. If you do not send ids, all polylines will be removed.
     */
    public removeLine(ids?: number[]){
        this.map.removePolylines(ids);
    }

    public trackUser(){
        var bearing = this.autoRotate;
        if (bearing){
            this.map.trackUser({mode: "FOLLOW_WITH_HEADING", animated: true});
        } else {
            this.map.trackUser({mode: "FOLLOW", animated: true});
        }
    }

    public setMapStyle(style = "outdoors"){         
        var styleObject = this.styles.find(x => x.name == style);
        if (styleObject != undefined){
            this.map.setMapStyle(styleObject.value);
        }
    }

    /**
     * flyTo(): Flies the camera to the specified location or the current location of the device.
     * 
     * @param zoomLevel: How far the camera should zoom in(only applies to android). Default: 14.
     * 
     * @param altitude: How high in meters the camera should stop above ground(only applies to iOS)
     * 
     * @param bearing: The direction of the compass in degrees. If not specified, it is the same as it was.
     * 
     * @param duration: For how long the animation should take in milliseconds. Default: 4000
     * 
     * @param maxAge: How old the location reading can be in milliseconds.
     * 
     * @param LocationObject: An object that need latitude and longitude which is numbers if specified.
     * 
     */
    flyTo(zoomLevel = 14, altitude = 5000, track = false, duration = 4000, maxAge?, LocationObject?) {
        // Function to get the camera to fly to the current location of the device
        var trackUser = this.trackUser;
        var map = this.map;
        var location;
        if (LocationObject == undefined){
            console.log("map.component: location not specified. Trying to find current location");
            this.locationClass.getLocation(maxAge, 10000, 0)
                .then(function(result){
                    location = result;
                    map.animateCamera({
                        // Target is the destination for the camera, which is the location of the device
                        target: {
                            lat: location.lat, 
                            lng: location.lng
                        },
                        zoomLevel: zoomLevel, // Zoom level on Android
                        altitude: altitude, // altitude above the ground in metres on iOS
                        duration: duration // How long the animation lasts
                    }).then(function() {
                        if (track){
                            globals.MainMap.trackUser();
                        }
                    });
                    
                    return location.horizontalAccuracy;
                }, function(err){
                    console.log("map.component: An error occured. " + err);
                    return new Error("Could not get location" + err);
                });
        } else {
            console.log("map.component: Got a locationObject");
            location = LocationObject;
            map.animateCamera({
                // Target is the destination for the camera, which is the location of the device
                target: {
                    lat: location.lat, 
                    lng: location.lng
                },
                zoomLevel: 14, // Zoom level on Android
                altitude: 5000, // altitude above the ground in metres on iOS
                bearing: 0, // The direction of the camera in degrees(0 - 360)
                duration: 4000 // How long the animation lasts
            });
        }
    }

  // Waits until the map is ready
  onMapReady(args): void {
    // Gets the map that is displayed
    this.map = args.map;
    if (this.main == "true"){
    globals.setMap(this);
    }

    var map = this.map;
    this.locationClass.getLocation(undefined, 3000, 0).then(function (loc) {
        console.log("Latitude: " + loc.lat + ", longitude: " + loc.lng);
        map.setCenter({lat: loc.lat, lng: loc.lng, animated: false});
        map.setZoomLevel({level: 16, animated: false});
    }, function (err) {
        console.log("ERROR: ");
        console.dir(err);
    });
    var styleSetting = globals.settingsService.getSetting(undefined, 11);
    if (styleSetting != undefined){
        this.setMapStyle(this.styles[styleSetting.value].name);
    }

  }

  ngOnInit() {
      
  }

}
