import { Component, OnInit } from "@angular/core";
import { Page } from "tns-core-modules/ui/page/page";
import { TripService } from "./trip.service";
import { AppComponent } from "../app.component";
import { Trip, Tracker } from "../tracker";
import { RouterExtensions } from "nativescript-angular/router";
import * as fs from 'tns-core-modules/file-system';
import * as globals from "../globals";

import { registerElement } from 'nativescript-angular/element-registry';
registerElement('Fab', () => require('nativescript-floatingactionbutton').Fab);

@Component({
    selector: "Home",
    moduleId: module.id,
    templateUrl: "./home-page.component.html",
    styleUrls: ["./home-page.component.css"],
})
export class HomePageComponent implements OnInit {

    constructor(page: Page, private routerext: RouterExtensions) {
        // Use the component constructor to inject providers.
        page.actionBarHidden = true;
        this.tripService = new TripService();
        if (globals.MainTracker == undefined){
            console.log("Main tracker does not exist,  making a new one");
            globals.setTracker(new Tracker(1, false));
        }
        this.checkPrevTrip();
        this.tripText = this.checkTrip();
    }

    private trips: Trip[];
    private isTrip: boolean;

    private tripService: TripService;

    private tripText = "Ny Tur";
    private tripClass = "newTripBtn";

    /**
     * checkTrip() - Checks if a trip is in progress, and choose what button to be displayed. "Gå til tur" if a trip is in progress, "Ny tur" if not.
     */
    private checkTrip(){
        if (this.tripService.isTrip()){
            this.isTrip = true;
            this.tripClass = "tripBtn oldTripBtn";
            return "Gå til tur";
        } else {
            this.isTrip = false;
            this.tripClass = "tripBtn newTripBtn";
            return "Ny Tur";
        }
    }

    /**
     * Check if the previous trip was finished. If it wasnt, load the trip into the tracker so it can continue.
     */
    private checkPrevTrip(){
        if (this.tripService.isTrip()){
            return;
        }
        try {
            // Check if a trip is currently going on when opening the app:
            var folder = fs.knownFolders.documents().getFolder("Trips");
                // Getting the file
            var file = folder.getFile("CurrentTrip.json");
            var currentTrip = JSON.parse(file.readTextSync());

            var tripID = currentTrip.tripID;
            var trip: Trip = currentTrip.trip;
            var tripTrips: Trip[] = currentTrip.tripTrips;
            var totalTime = currentTrip.totalTime;
            // Checking if the last trip was finished
            if (!this.tripService.doesTripExist(tripID)){
                console.log("Prev trip not finsihed");
                // If it wasnt, we resume the trip
                var date = new Date(trip.stopTime);
                if ((Date.now() - date.getTime()) < 24 * 60 * 60 * 1000){
                    console.log("Resuming Trip");
                    globals.MainTracker.loadTrip(tripID,trip, tripTrips, totalTime);
                    // TODO: Open the drawer and select button
                    //this.routerext.navigateByUrl("home/currentTrip");
                }
            }    
        } catch (error) {
            console.log("There was an error while resuming previous trip");
            console.log(error);
        }   
    }

    deleteTripFolder(){
        this.tripService.deleteFolder();
    }

    ngOnInit(): void {
        // Init your component properties here.
        this.trips = this.tripService.getTrips();
    }
}
