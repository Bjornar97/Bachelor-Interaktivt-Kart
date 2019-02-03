import { Component, OnInit } from '@angular/core';
import { MapboxViewApi, Viewport as MapboxViewport } from "nativescript-mapbox";

@Component({
  selector: 'ns-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  moduleId: module.id,
})
export class MapComponent implements OnInit {

  private map: MapboxViewApi;

  // Waits until the map is ready
  onMapReady(args): void {
      // Gets the map that is displayed
      this.map = args.map;
      
      // Waits 2 seconds
      setTimeout(() => {
          // Put this into a local variable, because this cannot be called in the function below
          var _this = this;

          // Function in the plugin for getting the location of the device and put it into the variable userLocation
          this.map.getUserLocation().then(
              function(userLocation) {
                  // Function to get the camera to fly to the current location of the device
                  _this.map.animateCamera({
                      // Target is the destination for the camera, which is the location of the device
                      target: {
                          lat: userLocation.location.lat, 
                          lng: userLocation.location.lng
                      },
                      zoomLevel: 14, // Zoom level on Android
                      altitude: 5000, // altitude above the ground in metres on iOS
                      bearing: 0, // The direction of the camera in degrees(0 - 360)
                      duration: 4000 // How long the animation lasts
                  });
              }
          )
      }, 2000);

  }

  ngOnInit() {
    console.log("initted map in component")
  }

}
