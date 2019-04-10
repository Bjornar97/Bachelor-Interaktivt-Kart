import { Component, OnInit, Input } from '@angular/core';
import { MapboxViewApi, MapboxMarker, Viewport as MapboxViewport, LatLng, latitudeProperty } from "nativescript-mapbox";
import { LocationClass, LocationObject } from "../location";
import * as globals from "../globals";
import { SettingsService, Setting } from '../settings-page/settings.service';
import * as application from "tns-core-modules/application";
import { MarkerService } from './marker.service';

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
    
    private settingsClass: SettingsClass;

    constructor(private markerService: MarkerService) {
        this.locationClass = new LocationClass(1);
    }

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
     * getCenter - Get the center of the map
     */
    public getCenter() {
        return this.map.getCenter();
    }

    public getZoom(){
        return this.map.getZoomLevel();
    }

    /**
     * addMarkers
     * @param markers
     */
    public addMarkers(markers: MapboxMarker[]) {
        this.map.addMarkers(markers);
    }

    public removeMarkers(ids?: number[]){
        if (ids != undefined){
            this.map.removeMarkers(ids);
        } else {
            this.map.removeMarkers();
        }
    }

    /**
     * 
     * @param points An array of points the line should go between. The points need to be in type LatLng with latitude and longitude.
     * @param color The color of the line.  default: red.
     * @param width The width of the line. default: 1.
     * @param opacity The opacity of the line. Default: 0.7.
     */
    public drawLine(points: LatLng[], id?: number, color = "#ff0000", width = 4, opacity = 0.7){
        var promise = this.map.addPolyline({id: id, color: color, points: points, width: width, opacity: opacity});
        console.log("Drew line");
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
        var bearingSetting = this.settingsService.getSetting(undefined, 1);
        let bearing;
        if (bearingSetting == null){
            bearing = true;
        } else {
            bearing = bearingSetting.value;
        }
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
                .then((result) => {
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
                    }).then(() => {
                        this.saveMapPosition(result);
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
                zoomLevel:zoomLevel, // Zoom level on Android
                altitude: altitude, // altitude above the ground in metres on iOS
                bearing: 0, // The direction of the camera in degrees(0 - 360)
                duration: duration // How long the animation lasts
            }).then(function() {
                if (track){
                    globals.MainMap.trackUser();
                }
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
    
    let imageMarkerSetting = this.settingsService.getSetting(undefined, 2);
    if (imageMarkerSetting != undefined){
        console.log("imageMarkerSetting is defined");
        if (imageMarkerSetting.value){
            console.log("imageMarkerSetting is true");
            let markers = this.markerService.getMarkers("image");
            this.map.addMarkers(markers);
        } else {
            console.log("imageMarkerSetting is false");
        }
    } else {
        console.log("imageMarkerSetting is not defined");
        imageMarkerSetting = {
            id: 2,
            name: "showImageMarkers",
            type: "switch",
            value: true
        }
        let markers = this.markerService.getMarkers("image");
        this.map.addMarkers(markers);
        this.settingsService.setSetting(imageMarkerSetting);
    }

    let map = this.map;

    // If the setting exists, it uses that to set the center and zoom level of the map
    if (this.mapSetting.value != undefined){
        console.log("Center is being set from setting");
        map.setCenter({
            animated: false,
            lat: this.mapSetting.value.lat,
            lng: this.mapSetting.value.lng
        });
        map.setZoomLevel({
            animated: false,
            level: this.mapSetting.value.zoomLevel
        });
    } else {
        // If the setting does not exist, find the location of the device and use that.
        console.log("Setting center from location");
        this.locationClass.getLocation(undefined, 3000, 0).then((loc) => {
            console.log("Latitude: " + loc.lat + ", longitude: " + loc.lng);
            map.setCenter({lat: loc.lat, lng: loc.lng, animated: false});
            map.setZoomLevel({level: 16, animated: false});

            this.mapSetting = {
                id: 31,
                name: "mapSetting",
                type: "Object",
                value: {
                    lat: loc.lat,
                    lng: loc.lng,
                    zoomLevel: 16
                }
            }
            
            this.settingsService.setSetting(this.mapSetting);
        }, function (err) {
            console.log("ERROR: ");
            console.dir(err);
        });
    }

    map.setOnScrollListener((point?) => {
        this.saveMapPosition(point);
    });

    // App went to background...
    application.on(application.suspendEvent,() => {
    });

    // App was reopened...
    application.on(application.resumeEvent, () => {
       
    });

    var styleSetting = this.settingsService.getSetting(undefined, 11);
    if (styleSetting != undefined){
        this.setMapStyle(styleSetting.value);
    }

  }

  public saveMapPosition(point: {lat: number, lng: number}){
    this.currentPoint = point;
    if (!this.saved){
        console.log("Saving");
        this.saved = true;
        setTimeout(() => {
            this.map.getZoomLevel().then((zoom) => {
                if (zoom != undefined && this.mapSetting.value != undefined){
                    if (this.mapSetting.value.lat != undefined){
                        this.mapSetting.value.lat = this.currentPoint.lat;
                        this.mapSetting.value.lng = this.currentPoint.lng;
                        this.mapSetting.value.zoomLevel = zoom;
                    } else {
                        this.mapSetting.value = {
                            lat: point.lat,
                            lng: point.lng,
                            zoomLevel: zoom
                        }
                    }
                    this.settingsService.setSetting(this.mapSetting);
                    this.saved = false;
                }
            });
            this.saved = false;
        }, 1000);
    } else {

    }
  }

  private saved: boolean;
  private currentPoint;

  private mapSetting: Setting;

  ngOnInit() {
      
  }

}