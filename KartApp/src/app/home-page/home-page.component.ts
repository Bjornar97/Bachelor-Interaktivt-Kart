import { Component, OnInit } from "@angular/core";
import { Page } from "tns-core-modules/ui/page/page";
import { MapComponent } from "../map/map.component";
import { MainMap } from "../globals";
import { LocationClass } from "../location";
import { Tracker, Trip } from "../tracker";

@Component({
    selector: "Home",
    moduleId: module.id,
    templateUrl: "./home-page.component.html"
})
export class HomeComponent implements OnInit {

    constructor(page: Page) {
        // Use the component constructor to inject providers.
        page.actionBarHidden = true;
        this.locationClass = new LocationClass;
        this.tracker = new Tracker(1);
    }

    private tripComplete = false;
    private trip: Trip;

    private locationClass: LocationClass;
    private tracker: Tracker;

    startTrack(){
        this.tracker.startTrip();
        this.tripComplete = false;
    }

    stopTrack(){
        var Trip = this.tracker.endTrip();
        this.trip = Trip;
        this.tripComplete = true;
        Trip.points.forEach(function(point){
            console.log("Lat: " + point.lat + ", Lng: " + point.lng + ", Speed: " + point.speed);
        });
        console.dir(Trip.points);

    }

    ngOnInit(): void {
        // Init your component properties here.
    }
}
