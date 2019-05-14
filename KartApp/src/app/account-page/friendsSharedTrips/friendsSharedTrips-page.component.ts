import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { BackendService } from '../backend.service';
import { Trip } from '~/app/tracker';
import * as globals from "~/app/globals";
import { Page } from 'tns-core-modules/ui/page/page';
import { RouterExtensions } from 'nativescript-angular/router';
import { isAndroid } from "tns-core-modules/platform";
import * as application from 'tns-core-modules/application';
import { GC } from 'tns-core-modules/utils/utils';


@Component({
    selector: 'ns-friends-shared-trips',
    templateUrl: './friendsSharedTrips-page.component.html',
    styleUrls: ['./friendsSharedTrips-page.component.css'],
    providers: [BackendService],
    moduleId: module.id,
  })
export class FriendsSharedTripsPageComponent implements OnInit, AfterViewInit, OnDestroy {

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
                    //this.subTrip.points.forEach((point) => {
                    //    if (prevPoint != null) {
                    //        this.Trip.distanceMeters += LocationClass.findDistance(prevPoint, point);
                    //    }
                    //    prevPoint = point;
                    //});
                    trips.forEach(trip => {
                        let currentTripObject: Trip = JSON.parse(trip.tripjson);
                        trip.tripjson = currentTripObject;
                    });

                    let tripsSorted = trips.sort((a, b) => {
                        if (a.tripjson.startTime > b.tripjson.startTime) {
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
        if (isAndroid){
            application.android.on(application.AndroidApplication.activityBackPressedEvent, (args: any) => {
              args.cancel = true;
              this.goBack();
            });
          }
          globals.setTripPrevious("account/friendsSharedTrips");
    }

    ngAfterViewInit() {
        this.getTrips();
    }

    ngOnDestroy() {
        GC();
    }
    
}