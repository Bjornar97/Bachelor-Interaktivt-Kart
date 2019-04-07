import { Component, OnInit, Input, ElementRef, ViewChild, OnDestroy } from "@angular/core";
import { Page } from "tns-core-modules/ui/page/page";
import { TripService } from "./trip.service";
import { Trip, Tracker } from "../tracker";
import { RouterExtensions } from "nativescript-angular/router";
import {Router, Event, NavigationEnd} from '@angular/router';
import * as fs from 'tns-core-modules/file-system';
import * as globals from "../globals";
import { DrawerClass } from "~/app/drawer";
import { GC } from "tns-core-modules/utils/utils";

@Component({
    selector: "Home",
    moduleId: module.id,
    templateUrl: "./home-page.component.html",
    styleUrls: ["./home-page.component.css"]
})
export class HomePageComponent implements OnInit, OnDestroy {
    private drawer: DrawerClass;

    constructor(private page: Page, private routerext: RouterExtensions, private router: Router, private tripService: TripService) {
        // Use the component constructor to inject providers.
        if (globals.MainTracker == undefined){
            console.log("Main tracker does not exist,  making a new one");
            globals.setTracker(new Tracker(1));
        }
        page.actionBarHidden = true;
        
        this.drawer = globals.getDrawer();
        this.tracker = globals.MainTracker;

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
        let index = this.trips.indexOf(trip);
        delete this.trips[index];
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

    ngOnDestroy(){
        GC();
    }

    ngOnInit(): void {
        // Init your component properties here.
        var tripsUnsorted=this.tripService.getTrips();
        this.trips=this.tripService.sortTrips(tripsUnsorted);
        GC();
    }
}
