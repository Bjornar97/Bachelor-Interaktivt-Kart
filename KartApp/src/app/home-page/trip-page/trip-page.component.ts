import { Component, OnInit, OnDestroy } from '@angular/core';
import * as application from 'tns-core-modules/application';
import { RouterExtensions } from 'nativescript-angular/router';
import { TripService } from '../trip.service';
import { MainMap } from '~/app/globals';
import { Page, booleanConverter } from 'tns-core-modules/ui/page/page';
import { ActivatedRoute } from '@angular/router';
import { isAndroid } from "tns-core-modules/platform";
import { Trip } from '~/app/tracker';

let days = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];

let days = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];

@Component({
  selector: 'ns-trip-page',
  templateUrl: './trip-page.component.html',
  styleUrls: ['./trip-page.component.css'],
  providers: [TripService],
  moduleId: module.id,
})
export class TripPageComponent implements OnInit, OnDestroy {

  constructor(private routerExtensions: RouterExtensions, private tripService: TripService, page: Page, private route: ActivatedRoute) { 
    page.actionBarHidden = true;
  }

  private sub;
  private backEvent;
  private trip: Trip;

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
    MainMap.removeLine();
    MainMap.drawLine(this.trip.points, "red", 3, 0.8);

    if (this.trip != undefined){
      this.totalTimeString = this.tripService.timeConversion(this.tripService.getTripTime(this.trip));
      var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'}
      // this.startTimeString = this.trip.startTime.toLocaleDateString("en-US", options); // Not working...

      var dateString: string;
      var time = this.trip.startTime;
      dateString =  days[time.getDay() - 1] + " " + time.getDate().toString() + "." + time.getMonth().toString() + "." + time.getFullYear().toString() + " " + time.getHours().toString() + ":" + time.getMinutes().toString();
      this.startTimeString = dateString;
      var dateStringStop;
      var timeStop = this.trip.stopTime;
      dateStringStop =  days[time.getDay() - 1] + " " + timeStop.getDate().toString() + "." + timeStop.getMonth().toString() + "." + timeStop.getFullYear().toString() + " " + timeStop.getHours().toString() + ":" + timeStop.getMinutes().toString();
      this.stopTimeString = dateStringStop;
    }
  }

  ngOnDestroy(){
    this.sub.unsubscribe();
    if (isAndroid) {
      application.android.removeEventListener(application.AndroidApplication.activityBackPressedEvent);
    }
  }

}
