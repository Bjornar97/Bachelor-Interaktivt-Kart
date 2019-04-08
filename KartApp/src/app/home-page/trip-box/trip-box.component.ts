import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { Trip } from '~/app/tracker';
import { TripService } from '../trip.service';
import { formatDate } from '@angular/common';
import { RouterExtensions } from 'nativescript-angular/router';
import * as dialogs from "tns-core-modules/ui/dialogs";
import { View } from 'tns-core-modules/ui/page/page';
import { screen } from "tns-core-modules/platform";
import * as globals from "~/app/globals";

let days = ["Søndag", "Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"];

@Component({
  selector: 'ns-trip-box',
  templateUrl: './trip-box.component.html',
  styleUrls: ['./trip-box.component.css'],
  providers: [TripService],
  moduleId: module.id,
})
export class TripBoxComponent implements OnInit, OnChanges {

  constructor(private tripService: TripService, private routerExt: RouterExtensions) { 

  }

  @Input() id: number;
  
  @Output()
  delete = new EventEmitter<string>();

  private checked: boolean = false;

  private trip: Trip;
  private totalTimeString: string;
  private startTimeString: string;
  private durationString: string;
  private distanceString: string;

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

  drawCheck(){
    if (this.trip == undefined){
      return;
    }
    if (this.checked){
      console.log("It is checked, drawing");
      this.tripService.drawTrip(this.trip.id);
    } else {
      console.log("Not checked, removing");
      this.tripService.unDrawTrip(this.trip.id);
    }
  }

  toggleCheck(){
    if (this.checked) {
      this.checked = false;
    } else {
      this.checked = true;
    }
    this.drawCheck();
  }

  ngOnChanges(){
    this.drawCheck();
  }

  ngOnInit() {
    this.trip = this.tripService.getTrip(this.id);
    if (this.trip != undefined){
      this.totalTimeString = globals.timeConversion(this.trip.duration);
      var time = new Date(this.trip.startTime);
      this.startTimeString = globals.timeMaker(time);
    }

    this.distanceString = (Math.round(this.trip.distanceMeters)/1000).toFixed(2);
    console.log("Distance: " + this.trip.distanceMeters + ". String: " + this.distanceString);
  }
}
