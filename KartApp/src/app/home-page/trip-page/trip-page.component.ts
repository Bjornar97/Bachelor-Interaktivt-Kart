import { Component, OnInit, OnDestroy } from '@angular/core';
import * as application from 'tns-core-modules/application';
import { RouterExtensions } from 'nativescript-angular/router';
import { TripService } from '../trip.service';
import { MainMap } from '~/app/globals';
import { Page, booleanConverter } from 'tns-core-modules/ui/page/page';
import { ActivatedRoute } from '@angular/router';

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
  private trip;

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.trip = this.tripService.getTrip(parseInt(params['id']));
      var cangoback;
      try {
        cangoback = booleanConverter(params['canGoBack']); 
      } catch (error) {
        cangoback = false;
      }
      if (!cangoback){
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
    MainMap.drawLine(this.trip.points, "green", 4, 1);
  }

  ngOnDestroy(){
    this.sub.unsubscribe();
    application.android.removeEventListener(application.AndroidApplication.activityBackPressedEvent);
  }

}
