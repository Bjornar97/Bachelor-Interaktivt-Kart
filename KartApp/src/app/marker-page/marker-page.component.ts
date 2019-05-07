import { Component, OnInit } from '@angular/core';
import * as globals from "../globals";
import { DrawerClass } from "~/app/drawer";
import { RouterExtensions } from 'nativescript-angular/router';
import { Page } from 'tns-core-modules/ui/page/page';
import { isAndroid } from "tns-core-modules/platform";
import * as application from 'tns-core-modules/application';
import { MapboxMarker } from 'nativescript-mapbox';
import { MarkerService } from "../map/marker.service";
import { ActivatedRoute } from '@angular/router';
import { ImageService } from '~/app/home-page/image.service';

@Component({
  selector: 'ns-marker-page',
  templateUrl: './marker-page.component.html',
  styleUrls: ['./marker-page.component.css'],
  moduleId: module.id,
})
export class MarkerPageComponent implements OnInit {
  
  private drawer: DrawerClass;

  constructor(private routerExtensions: RouterExtensions, private route: ActivatedRoute, private markerService: MarkerService, private imageService: ImageService, page: Page) {
    this.drawer = globals.getDrawer();
    page.actionBarHidden = true;
  }
  
  private pageTitle = "Marker";
  private backButtonText = "Tilbake";

  private goBack() {
    this.routerExtensions.backToPreviousPage();
  }
  
  private sub;
  private marker: MapboxMarker;
  private imageSrc: string;

  ngOnInit() {
    if (isAndroid){
      application.android.on(application.AndroidApplication.activityBackPressedEvent, (args: any) => {
        args.cancel = true;
        this.goBack();
      });
    }
    this.sub = this.route.params.subscribe(params => {
      this.marker = this.markerService.getMarkers(undefined, [parseInt(params["id"])])[0];
      this.imageSrc = this.imageService.getImageSrc(this.marker.id);
      this.pageTitle = "Marker " + this.marker.id;
    });
  }

}