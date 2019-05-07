import { Component, OnInit, OnDestroy } from '@angular/core';
import * as application from 'tns-core-modules/application';
import { RouterExtensions } from 'nativescript-angular/router';
import { TripService } from '../trip.service';
import  * as globals from '~/app/globals';
import { Page, booleanConverter } from 'tns-core-modules/ui/page/page';
import { ActivatedRoute } from '@angular/router';
import { isAndroid } from "tns-core-modules/platform";
import { Trip } from '~/app/tracker';
import { DrawerClass } from '~/app/drawer';
import { ImageService } from '../image.service';

let days = ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"];

@Component({
  selector: 'ns-trip-page',
  templateUrl: './trip-page.component.html',
  styleUrls: ['./trip-page.component.css'],
  providers: [TripService],
  moduleId: module.id,
})
export class TripPageComponent implements OnInit, OnDestroy {
  private drawer: DrawerClass;

  constructor(private routerExtensions: RouterExtensions, private tripService: TripService, page: Page, private route: ActivatedRoute, private imageService: ImageService) { 
    this.drawer = globals.getDrawer();
    page.actionBarHidden = true;
  }

  private sub;
  private backEvent;
  private trip: Trip;
  private events;
  
  private pageTitle = "Trip";
  private backButtonText = "Tilbake";

  private goBack(){
    if (!globals.getCheckboxList(this.trip.id)) {
      this.tripService.unDrawTrip(this.trip.id);
    }
    this.routerExtensions.navigate(["home"], {
      animated: true,
      clearHistory: true,
      transition: {
        name: "slideRight"
      }
    });
  }

  private totalTimeString: string;
  private startTimeString: string;
  private stopTimeString: string;
  private distanceString: string;

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.trip = this.tripService.getTrip(parseInt(params['id']));
      var cangoback;
      try {
        cangoback = booleanConverter(params['canGoBack']); 
      } catch (error) {
        cangoback = false;
      }
      if (isAndroid){
        application.android.on(application.AndroidApplication.activityBackPressedEvent, (args: any) => {
          args.cancel = true;
          this.goBack();
        });
      }
      
      globals.setCurrentHomePage("home/trip/" + this.trip.id);
      // In a real app: dispatch action to load the details here.
    });
    // TODO: Tegne trip i kartet
    this.tripService.drawTrip(this.trip.id);

    console.log("Getting trip events: ");
    this.events = this.tripService.getTripEvents(this.trip.id);
    console.log("Got events: ");
    console.dir(this.events);
    console.log("Making strings");
    if (this.trip != undefined){
      this.totalTimeString = globals.timeConversion(this.trip.duration);
      this.startTimeString = globals.timeMaker(new Date(this.trip.startTime));
      this.stopTimeString = globals.timeMaker(new Date(this.trip.stopTime));
      this.distanceString = (this.trip.distanceMeters / 1000).toFixed(2);
    }
    console.log("Finished making strings");
  }

  ngOnDestroy(){
    if (!globals.getCheckboxList(this.trip.id)) {
      this.tripService.unDrawTrip(this.trip.id);
    }
    this.sub.unsubscribe();
    if (isAndroid) {
      application.android.removeEventListener(application.AndroidApplication.activityBackPressedEvent);
    }
  }

}
