import { Component, OnInit } from "@angular/core";
import { MapboxViewApi, Viewport as MapboxViewport } from "nativescript-mapbox";
import { Page } from "ui/page";

@Component({
    selector: "map-page",
    moduleId: module.id,
    templateUrl: "./map-page.component.html"
})
export class MapPageComponent implements OnInit {

    private map: MapboxViewApi;


    constructor(page: Page) {
        // Use the component constructor to inject providers.
        // Remove the actionBaron the top of the app
        page.actionBarHidden = true;
    }

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

    ngOnInit(): void {
        // Init your component properties here.
    }
}
