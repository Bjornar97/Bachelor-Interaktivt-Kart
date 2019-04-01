import { Component, OnInit } from '@angular/core';
import { MapboxMarker } from 'nativescript-mapbox';
import { MarkerService } from "../map/marker.service";
import { DrawerClass } from "~/app/drawer";
import * as globals from "../globals";
import { RouterExtensions } from 'nativescript-angular/router/router-extensions';
import { ActivatedRoute } from '@angular/router/src/router_state';
import { ImageService } from '~/app/home-page/image.service';

@Component({
  selector: 'ns-marker-page',
  templateUrl: './marker-page.component.html',
  styleUrls: ['./marker-page.component.css'],
  moduleId: module.id,
})
export class MarkerPageComponent implements OnInit {
  
  private drawer: DrawerClass;
  private sub;
  private marker: MapboxMarker;
  private imageSrc: string;

  constructor(private routerExtension: RouterExtensions, private route: ActivatedRoute, private markerService: MarkerService, private imageService: ImageService) {
    this.drawer = globals.getDrawer();
  }

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.marker = this.markerService.getMarkers(undefined, [parseInt(params["id"])])[0];
      this.imageSrc = this.imageService.getImageSrc(this.marker.id);
    });
  }

}
