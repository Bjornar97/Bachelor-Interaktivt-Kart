import { Component, OnInit, Input } from '@angular/core';
import { Trip } from '~/app/tracker';
import { TripService } from '../trip.service';
import { formatDate } from '@angular/common';

let days = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"];

@Component({
  selector: 'ns-trip-box',
  templateUrl: './trip-box.component.html',
  styleUrls: ['./trip-box.component.css'],
  providers: [TripService],
  moduleId: module.id,
})
export class TripBoxComponent implements OnInit {

  constructor(private tripService: TripService) { 

  }

  @Input() id: number;

  private trip: Trip;
  private totalTimeString: string;
  private startTimeString: string;


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
