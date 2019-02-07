import { Component, OnInit } from "@angular/core";
import { Page } from "tns-core-modules/ui/page/page";
import { MapComponent } from "../map/map.component";
import { MainMap } from "../globals";

@Component({
    selector: "Home",
    moduleId: module.id,
    templateUrl: "./home-page.component.html"
})
export class HomeComponent implements OnInit {

    constructor(page: Page) {
        // Use the component constructor to inject providers.
        page.actionBarHidden = true;
        this.mapComponent = new MapComponent;
    }

    private mapComponent: MapComponent;

    goToLocation (latitude?, longitude?) {
        console.log("Going to location");
        if (latitude != undefined && longitude != undefined){
            MainMap.flyTo(16, 2000, 0, 5000, 10000, {latitude: latitude, longitude: longitude});
            
        } else {
            MainMap.flyTo(16, 1000, 0, 5000, 10000);
        }
    }

    ngOnInit(): void {
        // Init your component properties here.
    }
}
