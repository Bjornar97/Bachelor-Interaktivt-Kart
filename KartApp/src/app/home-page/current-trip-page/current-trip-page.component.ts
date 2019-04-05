import { Component, OnInit, ViewChild, ElementRef, AfterContentInit, AfterViewInit } from '@angular/core';
import { Page } from 'tns-core-modules/ui/page/page';
import { Trip, Tracker } from '~/app/tracker';
import { TripService } from '../trip.service';
import { RouterExtensions } from 'nativescript-angular/router';
import * as camera from "nativescript-camera";
import * as dialogs from "tns-core-modules/ui/dialogs";
import { MarkerService } from '~/app/map/marker.service';
import { LocationClass } from '~/app/location';
import * as globals from "~/app/globals";
import { DrawerClass } from '~/app/drawer';
import { on as applicationOn, exitEvent, ApplicationEventData } from "tns-core-modules/application";
import { Setting, SettingsService } from '~/app/settings-page/settings.service';
import { trigger, transition, style, animate, state } from "@angular/animations";


@Component({
  selector: 'ns-current-trip-page',
  animations: [
    trigger('imagesFadeInOut', [
      state("visible", style({
        opacity: 1
      })),
      state("notVisible", style({
        opacity: 0
      })),
      transition("visible => notVisible", [
        animate("1s")
      ]),
      transition("notVisible => visible", [
        animate("1s"),
      ]),
    ]),
  ],
  templateUrl: './current-trip-page.component.html',
  styleUrls: ['./current-trip-page.component.css'],
  providers: [TripService, MarkerService],
  moduleId: module.id,
})
export class CurrentTripPageComponent implements OnInit, AfterViewInit {

  constructor(private page: Page, private routerExtensions: RouterExtensions, private markerService: MarkerService, private tripService: TripService, private settingsService: SettingsService) { 
    this.locationClass = new LocationClass();
    this.tracker = globals.MainTracker;
    page.actionBarHidden = true;
  }

  private tracker: Tracker;
  private trip: Trip;

  private locationClass: LocationClass;

  private paused: boolean = false;

  color = "";

  gree(){
    this.color = "gree";
  }

  yell(){
    this.color = "yell";
  }

  changecol(){
    console.log("Chagning color from " + this.color);
    this.color == "gree" ? this.yell(): this.gree();
  }

  private imageSrcs: any[] = [];

  private btnActiveText = "Pause";
  private btnActiveClass = " btn btn-pause";

  private isLoading = false;

  private drawer: DrawerClass;

  private goBack(){
    let height = this.drawer.drawer.heightInt;
    let setting = this.settingsService.getSetting(undefined, 52);
    if (setting == undefined) {
      setting = {
        id: 52,
        name: "currentTripPageHeight",
        type: "height",
        value: height
      }
    }
    if (height <= 350){
      setting.value = 160;
    } else {
      setting.value = height;
    }
    this.settingsService.setSetting(setting);
    this.routerExtensions.navigate(["home"], {animated: true, transition: {name: "slideRight"}});
  }

  private timeMaker(timestamp: number) {
    return globals.timeMaker(new Date(timestamp));
  }

  @ViewChild("scrollView") scrollView: ElementRef;

  private scrollLoaded(){
    console.log("Scrolling right");
    setTimeout(() => {
      this.scrollView.nativeElement.scrollToHorizontalOffset(100000);
    }, 5000);
  }

  /**
   * OpenCamera() - Opens the native camera on the device, so you can take pictures.
   */
  OpenCamera(){
    console.log("Taking picture");
    let saveImageSetting = this.settingsService.getSetting(undefined, 4);
    if (saveImageSetting == undefined || saveImageSetting == null){
      saveImageSetting = {
        id: 4,
        name: "saveImage",
        type: "switch",
        value: false
      }
      this.settingsService.setSetting(saveImageSetting);
    }
    camera.requestPermissions().then(
      () => {
        camera.takePicture({saveToGallery: saveImageSetting.value}).then((imageAsset) => {
          this.locationClass.getLocation(5000, 10000, 1).then((loc) => {
            this.tripService.saveImage(imageAsset, loc.lat, loc.lng, "marker/image/", "res://image_marker").then(() => {
              this.trip = this.tripService.getCurrentTrip();
              this.trip.images.forEach((image) => {
                this.imageSrcs.push(image);
              });
            });
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
          this.routerExtensions.navigate(["home"], {animated: true, transition: {name: "slideRight"}});
        }
      } else if (pause){
        this.togglePause();
        this.isLoading = false;
      } else {
        this.isLoading = false;
      }
    });
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

  ngAfterViewInit(){
    let mountSetting = this.settingsService.getSetting(undefined, 3);
    if (mountSetting != null && mountSetting != undefined){
      if (mountSetting.value){
        let heightSetting = this.settingsService.getSetting(undefined, 52);
        if (heightSetting == undefined){
          heightSetting = {
            id: 52,
            name: "currentTripPageHeight",
            type: "height",
            value: 160
          }
        }
        this.drawer.setDrawerHeight(heightSetting.value);
      }
    }
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

    applicationOn(exitEvent, (args: ApplicationEventData) => {
      let tripActive: Setting = {
        id: 41,
        name: "tripActive",
        value: false,
        type: "Object"
      }
      if (!this.tripService.isPaused()) {
        tripActive.value = true;
        this.tripService.pauseTrip(); 
      }
      this.settingsService.setSetting(tripActive);
    });

  }
}
