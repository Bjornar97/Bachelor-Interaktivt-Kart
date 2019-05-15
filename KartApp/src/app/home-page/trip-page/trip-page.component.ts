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
import { BackendService } from '~/app/account-page/backend.service';
import { SettingsClass } from '~/app/settings-page/settings';

let days = ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"];

@Component({
  selector: 'ns-trip-page',
  templateUrl: './trip-page.component.html',
  styleUrls: ['./trip-page.component.css'],
  providers: [TripService, BackendService],
  moduleId: module.id,
})
export class TripPageComponent implements OnInit, OnDestroy {
  private drawer: DrawerClass;

  constructor(private backendService: BackendService, private routerExtensions: RouterExtensions, private tripService: TripService, page: Page, private route: ActivatedRoute, private imageService: ImageService) { 
    this.drawer = globals.getDrawer();
    page.actionBarHidden = true;
    this.settingsClass = globals.getSettingsClass();
  }

  private settingsClass: SettingsClass;

  private sub;
  private backEvent;
  private trip: Trip;
  private tripid: number;
  private events;
  private local: boolean;
  private failed: boolean = false;
  private marked;
  
  private loading: boolean;

  private pageTitle = "Trip";
  private backButtonText = "Tilbake";

  private goBack(){
    if (!this.failed && !globals.getCheckboxList(this.trip.id)) {
      this.tripService.unDrawTrip(this.tripid, this.local, this.trip);
    }
    this.routerExtensions.navigate([globals.getTripPrevious()], {
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

  setupTrip() {
    this.tripService.drawTrip(this.trip.id, this.local, this.trip);

    console.log("Getting trip events: ");
    this.events = this.tripService.getTripEvents(this.trip.id, this.local, this.trip);
    console.log("Making strings");
    if (this.trip != undefined){
      this.totalTimeString = globals.timeConversion(this.trip.duration);
      this.startTimeString = globals.timeMaker(new Date(this.trip.startTime));
      this.stopTimeString = globals.timeMaker(new Date(this.trip.stopTime));
      this.distanceString = (this.trip.distanceMeters / 1000).toFixed(2);
    }
    console.log("Finished making strings");
  }

  loadTrip() {
    try {
      this.loading = true;
      this.failed = false;
      this.backendService.getTrip(this.tripid).subscribe((result) => {
        if ((<any>result).status == 200) {
          let tripjson = (<any>result).body.trips[0];
          this.trip = JSON.parse(tripjson);
          this.trip.id = (<any>result).body.tid;
          this.loading = false;
          this.setupTrip();
        } else {
          globals.showError("Kunne ikke laste inn turen :(");
          this.failed = true;
          this.loading = false;
        }
      });
    } catch (error) {
      globals.showError("Kunne ikke laste inn turen :(");
      this.failed = true;
      this.loading = false;
    }

    setTimeout(() => {
      if (this.loading) {
        this.failed = true;
        this.loading = false;
        globals.showError("Kunne ikke laste inn turen :(");
      }
    }, 5000);
  }
  
  goToMarker(id: number){
    console.log(id);
    if (id != undefined){
      this.routerExtensions.navigate(["marker", "image", id], {
        animated: true,
        clearHistory: false,
        transition: {
          name: "fade"
        }
      });
    }
  }

  bookmark() {
    if (this.marked) {
      this.marked = false;
      this.tripService.unbookmarkTrip(this.tripid);
    } else {
      console.log("Bookmarking: " + this.tripid + ", " + this.trip.username);
      let success = this.tripService.bookmarkTrip(this.trip, this.tripid, this.trip.username);
      console.log("Success: " + success);
      if (success){
        this.marked = true;
      } else {
        globals.showError("Kunne ikke lagre tur, prøv igjen");
      }
      console.log("Done");
    }
  }

  roundNumber(innNumber: number) {
    return innNumber.toFixed(2);
  }

  goToTrip() {
    let startPoint = this.trip.startPoint;
    globals.MainMap.flyTo(16, 1500, false, undefined, undefined, startPoint);
    let snapPoints = this.settingsClass.getSetting(3, true).value;
    if (this.drawer.drawer.heightInt > 300 && snapPoints) {
      this.drawer.setDrawerHeight(150, false);
    }
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.tripid = parseInt(params['id']);
      try {
        this.local = booleanConverter(params['local']); 
      } catch (error) {
        this.local = false;
      }

      let savedTrip = this.tripService.getSavedTrip(this.tripid);
      console.dir(savedTrip);
      console.log("local: " + this.local + ", id: " + this.tripid);
      if (this.local) {
        console.log("Getting trip from getTrip in tripService");
        this.trip = this.tripService.getTrip(this.tripid); 
        this.setupTrip();
        globals.setCurrentHomePage("home/trip/" + this.trip.id);
      } else if (savedTrip != undefined){
        console.log("Using trip from savedTrips");
        this.trip = savedTrip;
        this.marked = true;
        this.setupTrip();
      } else {
        console.log("Getting trip from globals");
        this.trip = globals.CurrentTrip;
        console.dir(this.trip);
        this.setupTrip();
        this.marked = false;
      }
      
      if (isAndroid){
        application.android.on(application.AndroidApplication.activityBackPressedEvent, (args: any) => {
          args.cancel = true;
          this.goBack();
        });
      }
    });
    
  }

  ngOnDestroy(){
    if (!globals.getCheckboxList(this.trip.id) && !this.failed) {
      this.tripService.unDrawTrip(this.trip.id, this.local, this.trip);
    }
    this.sub.unsubscribe();
    if (isAndroid) {
      application.android.removeEventListener(application.AndroidApplication.activityBackPressedEvent);
    }
  }

}
