import { Component, OnInit } from '@angular/core';
import { Page } from 'tns-core-modules/ui/page/page';
import { Trip, Tracker } from '~/app/tracker';
import { TripService } from '../trip.service';
import { RouterExtensions } from 'nativescript-angular/router';
import * as camera from "nativescript-camera";
import { Image } from "tns-core-modules/ui/image";
import * as dialogs from "tns-core-modules/ui/dialogs";
import { MarkerService } from '~/app/map/marker.service';
import { LocationClass } from '~/app/location';
import * as globals from "~/app/globals";
import { DrawerClass } from '~/app/drawer';


@Component({
  selector: 'ns-current-trip-page',
  templateUrl: './current-trip-page.component.html',
  styleUrls: ['./current-trip-page.component.css'],
  providers: [TripService, MarkerService],
  moduleId: module.id,
})
export class CurrentTripPageComponent implements OnInit {

  constructor(page: Page, private routerExtensions: RouterExtensions, private markerService: MarkerService, private tripService: TripService) { 
    this.locationClass = new LocationClass();
    this.tracker = globals.MainTracker;
  }

  private tracker: Tracker;
  private trip: Trip;

  private locationClass: LocationClass;

  private startTime;
  private paused: boolean = false;

  private imageSrc;

  private btnActiveText = "Pause";
  private btnActiveClass = " btn btn-pause";

  private height = 200; // Want to get the drawer height into this
  private isLoading = false;

  private drawer: DrawerClass;

  private goBack(){
    this.routerExtensions.backToPreviousPage();
  }

  /**
   * OpenCamera() - Opens the native camera on the device, so you can take pictures.
   */
  OpenCamera(){
    console.log("Taking picture");
    camera.requestPermissions().then(
      () => {
        camera.takePicture({saveToGallery: false}).then((imageAsset) => {
          var image = new Image();
          image.src = imageAsset;
          this.imageSrc = image.src;
          this.tripService.saveImage(imageAsset);
          var location = this.locationClass.getLocation(5000, 10000, 1).then((loc) => {
            this.markerService.makeMarker(loc.lat, loc.lng, "marker/image/", "image", "res://image_marker_96");
          }).catch((error) => {
            console.log("ERROR in OpenCamera in currentTripPage: Error while getting location: " + error);
          });
        });
      }, 
      () => {
        console.log("The permission was not granted");
        // TODO: Show Error to the user.
      }
    );
  }

  /**
   * togglePause() - Toggle pause. Pause if not paused and unpause if it is paused.
   */
  private togglePause(){
    if (!this.paused){
      this.paused = true;
      this.tripService.pauseTrip();
      this.btnActiveText = "Play";
      this.btnActiveClass = "btn btn-play";
    } else { 
      this.paused = false;
      this.tripService.unpauseTrip();
      this.btnActiveText = "Pause";
      this.btnActiveClass = "btn btn-pause";
    }
  }

  /**
   * stopTrip() - Stop the current trip
   */
  private stopTrip(){
    this.isLoading = true;
    var pause;
    if (!this.paused){
      this.togglePause();
      pause = true;
    } else {
      pause = false;
    }

    var tripBefore = this.tripService.getCurrentTrip();

    let options = {
      title: "Stopp tur",
      message: "Er du sikker på at du vil stoppe turen?",
      okButtonText: "Ja",
      cancelButtonText: "Nei"
    };

    console.log("Before dialog");
    dialogs.confirm(options).then((result) => {
      console.log("After dialog");
      if (result){
        try {
          this.trip = this.tripService.endTrip();
          this.routerExtensions.navigateByUrl("home/trip/" + this.trip.id + "/false", {
            animated: true,
            clearHistory: true,
            transition: {name: "slideLeft"}
          });
        } catch (error) {
          console.log("ERROR while stopping trip in current-trip.component.ts: " + error);
          console.dir(tripBefore);


        }
      } else if (pause){
        this.togglePause();
        this.isLoading = false;
      } else {
        this.isLoading = false;
      }
    });
  }

  ngOnInit() {
    // Checks if there is a trip going on and chooses if the play-button or pause-button shuld be displayed
    if (this.tripService.isTrip()){
      console.log("There is a trip going on");
      this.trip = this.tripService.getCurrentTrip();

      if (this.tripService.isPaused()){
        console.log("Paused");
        this.paused = true;
        this.btnActiveText = "Play";
        this.btnActiveClass = "btn btn-play";
      }
      // If there is no trip going on, start a new trip.
    } else {
      this.tripService.startTrip();
      this.trip = this.tripService.getCurrentTrip();
    }

    this.drawer = globals.getDrawer();
    this.drawer.setDrawerHeight(220);
  }

}
