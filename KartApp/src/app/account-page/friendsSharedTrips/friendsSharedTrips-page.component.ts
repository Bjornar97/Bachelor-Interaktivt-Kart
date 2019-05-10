import { Component, OnInit, AfterViewInit } from '@angular/core';
import { BackendService } from '../backend.service';
import { Trip } from '~/app/tracker';
import * as globals from "~/app/globals";
import { Page } from 'tns-core-modules/ui/page/page';
import { RouterExtensions } from 'nativescript-angular/router';


@Component({
    selector: 'ns-friends-shared-trips',
    templateUrl: './friendsSharedTrips-page.component.html',
    styleUrls: ['./friendsSharedTrips-page.component.css'],
    providers: [BackendService],
    moduleId: module.id,
  })
export class FriendsSharedTripsPageComponent implements OnInit, AfterViewInit {

    private friendsTrips: Trip[] = [];

    private loading: boolean;

    private drawer;

    constructor(private backendService: BackendService, page: Page, private routerExtensions: RouterExtensions) {
        page.actionBarHidden = true;
        this.drawer = globals.getDrawer();
    }

    goBack() {
        this.routerExtensions.navigate(["account"], {animated: true, clearHistory: true, transition: {name: "slideRight"}});
    }

    getTrips() {
        this.loading = true;
        try {
            this.backendService.getFriendsTrips()
            .subscribe((result) => {
                if (<any>result.status == 200) {
                    let trips = (<any>result).body.trips;
                    console.log("Trips, length: " + trips.length);
                    console.dir(trips);
                    let tripsSorted = trips.sort((a, b) => {
                        let aTripjson: Trip = JSON.parse(a.tripjson);
                        let bTripjson: Trip = JSON.parse(b.tripjson);
                        if (aTripjson.startTime > bTripjson.startTime) {
                            return -1;
                        } else {
                            return 1;
                        }
                    });
                    this.friendsTrips = tripsSorted;
                    this.loading = false;
                }
            });
        } catch (error) {
            globals.showError("Kunne ikke laste inn venners turer, prøv igjen");
            this.loading = false;
        }

        setTimeout(() => {
            if (this.loading) {
                globals.showError("Kunne ikke laste inn venners turer, prøv igjen");
                this.loading = false;
            }
        }, 10000);
    }

    ngOnInit() {
        
    }

    ngAfterViewInit() {
        this.getTrips();
    }
}