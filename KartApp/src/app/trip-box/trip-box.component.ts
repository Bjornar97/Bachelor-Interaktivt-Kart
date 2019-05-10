import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { Trip } from '~/app/tracker';
import { TripService } from '../home-page/trip.service';
import { formatDate } from '@angular/common';
import { RouterExtensions } from 'nativescript-angular/router';
import * as dialogs from "tns-core-modules/ui/dialogs";
import { View, booleanConverter } from 'tns-core-modules/ui/page/page';
import { screen } from "tns-core-modules/platform";
import * as globals from "~/app/globals";
import { BackendService } from '~/app/account-page/backend.service';
import { SettingsClass } from '~/app/settings-page/settings';
import { destroyView } from '@angular/core/src/view/view';

@Component({
  selector: 'ns-trip-box',
  templateUrl: './trip-box.component.html',
  styleUrls: ['./trip-box.component.css'],
  providers: [TripService, BackendService],
  moduleId: module.id,
})
export class TripBoxComponent implements OnInit, OnChanges {

  constructor(private tripService: TripService, private routerExt: RouterExtensions, private backendService: BackendService) { 
    console.log("Made a trip-box");
    this.settingsClass = globals.getSettingsClass();
  }

  private settingsClass: SettingsClass;

  @Input() id: number;
  @Input() personal: string;
  @Input() username: string;

  @Input() inputTrip: string;
  
  @Output()
  delete = new EventEmitter<string>();

  private checked: boolean = false;
  private skipCheck = false;

  private loading: boolean;
  private trip: Trip;
  private totalTimeString: string;
  private startTimeString: string;
  private durationString: string;
  private distanceString: string;
  private uploaded: boolean;
  private failed: boolean;


  navigateToTrip() {
    if (!booleanConverter(this.personal)) {
      globals.setCurrentTrip(this.trip);
    }
    console.log("Navigating to trip");
    this.routerExt.navigate(["home", "trip", this.id, this.personal], {
      animated: true,
      clearHistory: false,
      transition: {
        name: "slideLeft"
      }
    });
  }

  deleteTrip(box: View){
    let options = {
      title: "Slette tur",
      message: "Er du sikker på at du vil slette denne turen? \n \nDette sletter turen for godt!",
      okButtonText: "Ja",
      cancelButtonText: "Nei"
    };
  
    dialogs.confirm(options).then((result: boolean) => {
      var screenWidth = screen.mainScreen.widthDIPs;
      if (result){
        this.tripService.unDrawTrip(this.trip.id);
        box.animate({
          scale: {x: 0, y: 0},
          duration: 700,
          delay: 200
         }).then(() => {
          this.tripService.deleteTrip([this.id]);
          this.routerExt.navigateByUrl("/home");
          this.delete.emit();
         });
      }
    });
  }

  upload() {
    if (this.uploaded) {
      this.failed = false;
      return;
    }
    this.loading = true;
    let token = this.settingsClass.getSetting(61, "").value;
    if (token == "") {
      globals.showError("Du må være logget inn for å laste opp turer");
      return;
    }
    try {
      this.backendService.uploadTrip(this.trip).subscribe((res) => {
        if (<any>res.status == 200 || <any>res.status == 201){
          console.log("Successfully uploaded trip");
          this.loading = false;
          this.failed = false;
          let setting = this.settingsClass.getSetting(42, []);
          setting.value.push(this.id);
          this.uploaded = true;
        } else {
          globals.showError("Noe gikk galt under opplasting av tur, husk at du må være logget inn");
          this.failed = true;
          this.loading = false;
        }
      });  
    } catch(error) {
      console.log("An error occured in upload in tripbox: " + error);
      globals.showError("Noe gikk galt under opplasting av tur");
      this.failed = true;
      this.loading = false;
    }

    setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        this.failed = true;
        globals.showError("Noe gikk galt under opplasting, prøv igjen");
      }
    }, 10000);
  }

  drawCheck(){
    if (this.trip == undefined){
      return;
    }
    if (this.checked){
      console.log("It is checked, drawing");
      this.tripService.drawTrip(this.trip.id, booleanConverter(this.personal), this.trip);
    } else {
      console.log("Not checked, removing");
      this.tripService.unDrawTrip(this.trip.id, booleanConverter(this.personal), this.trip);
    }
  }

  toggleCheck(){
    if (!this.skipCheck) {
      this.checked = !this.checked;
    } else {
      this.skipCheck = false;
    }
    globals.setCheckboxList(this.id, this.checked);
    this.drawCheck();
  }

  ngOnChanges(){
    this.drawCheck();
  }

  ngOnInit() {
    console.log("initting trip-box: " + this.personal);
    this.personal = JSON.parse(this.personal)
    if (this.personal) {
      console.log("Personal")
      this.trip = this.tripService.getTrip(this.id);
    } else {
      this.trip = JSON.parse(this.inputTrip);
    }
    
    if (this.trip != undefined){
      console.log("Trip is not undefined");
      this.totalTimeString = globals.timeConversion(this.trip.duration);
      var time = new Date(this.trip.startTime);
      this.startTimeString = globals.timeMaker(time);
      
      console.log("Created string and stuff");

    this.distanceString = (Math.round(this.trip.distanceMeters)/1000).toFixed(2);
    console.log("Distance: " + this.trip.distanceMeters + ". String: " + this.distanceString);
    if (globals.getCheckboxList(this.id)) {
      this.skipCheck = true;
      this.checked = true;
    }

    }

    if (this.personal){
      let uploadedList: Array<any> = this.settingsClass.getSetting(42).value;
      if (uploadedList.indexOf(this.id) != -1) {
        this.uploaded = true;
      } else {
        this.uploaded = false;
      }
    }
  }
}
