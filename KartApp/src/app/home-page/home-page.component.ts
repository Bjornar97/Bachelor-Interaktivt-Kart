import { Component, OnInit, Input, ElementRef, ViewChild } from "@angular/core";
import { Page } from "tns-core-modules/ui/page/page";
import { TripService } from "./trip.service";
import { Trip, Tracker } from "../tracker";
import { RouterExtensions } from "nativescript-angular/router";
import {Router, Event, NavigationEnd} from '@angular/router';
import * as fs from 'tns-core-modules/file-system';
import * as globals from "../globals";
import { DrawerClass } from "~/app/drawer";

@Component({
    selector: "Home",
    moduleId: module.id,
    templateUrl: "./home-page.component.html",
    styleUrls: ["./home-page.component.css"]
})
export class HomePageComponent implements OnInit {
    private drawer: DrawerClass;

    constructor(page: Page, private routerext: RouterExtensions, private router: Router, private tripService: TripService) {
        // Use the component constructor to inject providers.
        if (globals.MainTracker == undefined){
            console.log("Main tracker does not exist,  making a new one");
            globals.setTracker(new Tracker(1, false));
        }
        
        this.drawer = globals.getDrawer();
        this.tracker = globals.MainTracker;

        this.checkPrevTrip();
        this.checkTrip();

        this.router.events.subscribe((val) => {
            if(val instanceof NavigationEnd){
                if(this.router.url == "/home"){
                    this.trips = this.tripService.getTrips();
                    this.isTrip = this.tripService.isTrip();
                    this.checkTrip();
                };
            } 
        });
    }
    private tracker: Tracker;

    private trips: Trip[];
    private isTrip: boolean;
    private isPaused: boolean;

    private checkedAll: boolean = false;

    private toggleCheckAll(){
        if (this.checkedAll) {
            this.checkedAll = false;
        } else {
            this.checkedAll = true;
        }
    }

    delete(trip: Trip){
        delete this.trips[this.trips.indexOf(trip)];
    }

    /**
     * checkTrip() - Checks if a trip is in progress, and choose what button to be displayed. "Gå til tur" if a trip is in progress, "Ny tur" if not.
     */
    private checkTrip(){
        if (this.tripService.isTrip()){
            if (this.tripService.isPaused()){
                console.log("Trip is paused");
                this.isPaused = true;
            } else {
                console.log("Trip is not paused");
                this.isPaused = false;
            }

            this.isTrip = true;
        } else {
            this.isTrip = false;
        }
    }

    private togglePause(){
        if (this.tripService.isPaused()){
            this.tripService.unpauseTrip();
        } else {
            this.tripService.pauseTrip();
        }
        this.checkTrip();
    }

    /**
     * Check if the previous trip was finished. If it wasnt, load the trip into the tracker so it can continue.
     */
    private checkPrevTrip(){
        if (this.tripService.isTrip()){
            console.log("A trip is ongoing already!")
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
            console.dir(currentTrip);
            // Checking if the last trip was finished
            if (!this.tripService.doesTripExist(tripID)){
                console.log("Prev trip not finsihed");
                // If it wasnt, we resume the trip
                var date = new Date(trip.startTime);
                if ((Date.now() - date.getTime()) < 48 * 60 * 60 * 1000 && !trip.finished){
                    console.log("Resuming Trip");
                    globals.MainTracker.loadTrip(tripID, trip, tripTrips, totalTime);
                    // TODO: Open the drawer and select button. Maybe show error.
                    //this.routerext.navigateByUrl("home/currentTrip");
                }
            } else {
                console.log("Trip exists already: ");
                console.dir(this.tripService.getTrip(tripID));
            }
        } catch (error) {
            console.log("There was an error while resuming previous trip");
            console.log(error);
        }   
    }

    ngOnInit(): void {
        // Init your component properties here.
        this.trips = this.tripService.getTrips();
    }
}
