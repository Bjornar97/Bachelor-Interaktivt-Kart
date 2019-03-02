import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Trip } from '~/app/tracker';
import { TripService } from '../trip.service';
import { formatDate } from '@angular/common';
import { RouterExtensions } from 'nativescript-angular/router';
import * as dialogs from "tns-core-modules/ui/dialogs";

let days = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];

@Component({
  selector: 'ns-trip-box',
  templateUrl: './trip-box.component.html',
  styleUrls: ['./trip-box.component.css'],
  providers: [TripService],
  moduleId: module.id,
})
export class TripBoxComponent implements OnInit {

  constructor(private tripService: TripService, private routerExt: RouterExtensions) { 

  }

  @Input() id: number;
  
  @Output()
  delete = new EventEmitter<string>();

  private trip: Trip;
  private totalTimeString: string;
  private startTimeString: string;

  deleteTrip(){
    let options = {
      title: "Slette tur",
      message: "Er du sikker på at du vil slette denne turen? \n \nDette sletter turen for godt!",
      okButtonText: "Ja",
      cancelButtonText: "Nei",
      neutralButtonText: "Avbryt"
    };
  
    dialogs.confirm(options).then((result: boolean) => {
      if (result){
        this.tripService.deleteTrip([this.id]);
        this.routerExt.navigateByUrl("/home");
        this.delete.emit();
      }
    });
  }

  ngOnInit() {
    this.trip = this.tripService.getTrip(this.id);
    if (this.trip != undefined){
      this.totalTimeString = this.tripService.timeConversion(this.tripService.getTripTime(this.trip));
      var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'}
      // this.startTimeString = this.trip.startTime.toLocaleDateString("en-US", options); // Not working...

      var dateString: string;
      var time = this.trip.startTime;
      dateString =  days[time.getDay() - 1] + " " + time.getDate().toString() + "." + time.getMonth().toString() + "." + time.getFullYear().toString() + " " + time.getHours().toString() + ":" + time.getMinutes().toString();
      this.startTimeString = dateString;
    }
  }

}
