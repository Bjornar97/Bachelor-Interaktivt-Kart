import { Component, OnInit } from "@angular/core";
import { Page } from "tns-core-modules/ui/page/page";
import { MapComponent } from "../map/map.component";
import { MainMap } from "../globals";
import { LocationClass } from "../location";
import { Tracker } from "../tracker";

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

    private locationClass: LocationClass;
    private tracker: Tracker;

    startTrack(){
        this.tracker.startTrip();
    }

    stopTrack(){
        this.tracker.endTrip();
    }

    ngOnInit(): void {
        // Init your component properties here.
    }
}
