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
import * as globals from "../../globals";
import { ImageService } from '../image.service';

let days = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];

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
  }

  private sub;
  private backEvent;
  private trip: Trip;
  private events;

  private goBack(){
    this.routerExtensions.navigate(["home"], {
      animated: true,
      clearHistory: true,
      transition: {
        name: "slideRight"
      }
    });
  }

  private totalTimeString: string;
  private startTimeString;
  private stopTimeString;

  private totalTimeString: string;
  private startTimeString;
  private stopTimeString;

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.trip = this.tripService.getTrip(parseInt(params['id']));
      var cangoback;
      try {
        cangoback = booleanConverter(params['canGoBack']); 
      } catch (error) {
        cangoback = false;
      }
      if (!cangoback && isAndroid){
        application.android.on(application.AndroidApplication.activityBackPressedEvent, (args: any) => {
          args.cancel = true;
          this.routerExtensions.navigate(['home'], {
            animated: true,
            clearHistory: true,
            transition: {
              name: "slideRight"
            }
          });
        });
      }
      // In a real app: dispatch action to load the details here.
    });
    globals.MainMap.removeLine();
    // TODO: Tegne trip i kartet

    this.events = this.tripService.getTripEvents(this.trip.id);
    
    if (this.trip != undefined){
      this.totalTimeString = globals.timeConversion(this.trip.duration);
      this.startTimeString = globals.timeMaker(new Date(this.trip.startTime));
      this.stopTimeString = globals.timeMaker(new Date(this.trip.stopTime));
    }
  }

  ngOnDestroy(){
    this.sub.unsubscribe();
    if (isAndroid) {
      application.android.removeEventListener(application.AndroidApplication.activityBackPressedEvent);
    }
  }

}
