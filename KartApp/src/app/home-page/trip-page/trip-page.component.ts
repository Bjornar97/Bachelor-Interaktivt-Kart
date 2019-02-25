import { Component, OnInit } from '@angular/core';
import * as application from 'tns-core-modules/application';
import { RouterExtensions } from 'nativescript-angular/router';
import { TripService } from '../trip.service';
import { MainMap } from '~/app/globals';
import { Page } from 'tns-core-modules/ui/page/page';

@Component({
  selector: 'ns-trip-page',
  templateUrl: './trip-page.component.html',
  styleUrls: ['./trip-page.component.css'],
  providers: [TripService],
  moduleId: module.id,
})
export class TripPageComponent implements OnInit {

  constructor(private routerExtensions: RouterExtensions, private tripService: TripService, page: Page) { 
    page.actionBarHidden = true;
  }

  private trip;

  ngOnInit() {
    application.android.on(application.AndroidApplication.activityBackPressedEvent, (args: any) => {
      args.cancel = true;
      this.routerExtensions.navigate(["home"]);
    });
    var path = this.routerExtensions.router.url;
    var id = parseInt(path.split("/").pop());
    this.trip = this.tripService.getTrip(id);
    MainMap.drawLine(this.trip.points, "green", 4, 1);
  }

}
