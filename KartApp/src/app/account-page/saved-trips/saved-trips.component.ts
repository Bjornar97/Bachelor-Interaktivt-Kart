import { Component, OnInit } from '@angular/core';
import { TripService } from '~/app/home-page/trip.service';
import { Trip } from '~/app/tracker';
import { Page, isAndroid } from 'tns-core-modules/ui/page/page';
import { RouterExtensions } from 'nativescript-angular/router';
import * as application from 'tns-core-modules/application';
import { DrawerClass } from '~/app/drawer';
import * as globals from '~/app/globals';

@Component({
  selector: 'ns-saved-trips',
  templateUrl: './saved-trips.component.html',
  styleUrls: ['./saved-trips.component.css'],
  providers: [TripService],
  moduleId: module.id,
})
export class SavedTripsComponent implements OnInit {

  private savedTrips: Array<Trip>;

  private drawer: DrawerClass;


  constructor(page: Page, private tripService: TripService, private routerExtensions: RouterExtensions) { 
    page.actionBarHidden = true;
    this.drawer = globals.getDrawer();
  }

  private goBack() {
    this.routerExtensions.navigate(["account"], {
      animated: true,
      clearHistory: true,
      transition: {
        name: "slideRight"
      }
    });
  }

  convertToJson(trip: Trip) {
    return JSON.stringify(trip);
  }

  getTrips() {
    this.savedTrips = this.tripService.getBookmarkedTrips();
  }

  ngOnInit() {
    if (isAndroid){
      application.android.on(application.AndroidApplication.activityBackPressedEvent, (args: any) => {
        args.cancel = true;
        this.goBack();
      });
    }
    this.getTrips();
  }
}
