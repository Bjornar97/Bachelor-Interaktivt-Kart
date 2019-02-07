import { Component, OnInit, Input } from '@angular/core';
import { MapboxViewApi, Viewport as MapboxViewport } from "nativescript-mapbox";
import { LocationService } from "../location.service";
import { MainMap, setMap, buttons } from "../globals";

@Component({
  selector: 'ns-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  moduleId: module.id,
})
export class MapComponent implements OnInit {
    
    constructor(){
        this.locationService = new LocationService(1);
    }

    @Input() main: string;
    private locationService: LocationService;
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
     * flyTo(): Flies the camera to the specified location or the current location of the device.
     * 
     * zoomLevel: How far the camera should zoom in(only applies to android). Default: 14.
     * 
     * altitude: How high in meters the camera should stop above ground(only applies to iOS)
     * 
     * bearing: The direction of the compass in degrees. If not specified, it is the same as it was.
     * 
     * duration: For how long the animation should take in milliseconds. Default: 4000
     * 
     * maxAge: How old the location reading can be in milliseconds.
     * 
     * LocationObject: An object that need latitude and longitude which is numbers if specified.
     * 
     */
    flyTo(zoomLevel = 14, altitude = 5000, bearing?, duration = 4000, maxAge?, LocationObject?) {
        // Function to get the camera to fly to the current location of the device
        var map = this.map;
        var location;
        console.log("map.component: Getting ready to fly");
        if (LocationObject == undefined){
            console.log("map.component: location not specified. Trying to find current location");
            this.locationService.getLocation(maxAge, 10000, 0)
                .then(function(result){
                    location = result;
                    map.animateCamera({
                        // Target is the destination for the camera, which is the location of the device
                        target: {
                            lat: location.latitude, 
                            lng: location.longitude
                        },
                        zoomLevel: zoomLevel, // Zoom level on Android
                        altitude: altitude, // altitude above the ground in metres on iOS
                        bearing: bearing, // The direction of the camera in degrees(0 - 360)
                        duration: duration // How long the animation lasts
                    });
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
                    lat: location.latitude, 
                    lng: location.longitude
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
        setMap(this);
      }

      console.log("Trying to find location");
      var map = this.map;
      this.locationService.getLocation(undefined, 3000, 0).then(function (loc) {
          console.log("Latitude: " + loc.latitude + ", longitude: " + loc.longitude);
          map.setCenter({lat: loc.latitude, lng: loc.longitude, animated: false});
          map.setZoomLevel({level: 16, animated: false});
      }, function (err) {
          console.log("ERROR: ");
          console.dir(err);
      });

  }

  ngOnInit() {
      
  }

}
