import { Component, OnInit } from '@angular/core';
import { TripService } from '~/app/home-page/trip.service';
import { Trip } from '~/app/tracker';

@Component({
  selector: 'ns-saved-trips',
  templateUrl: './saved-trips.component.html',
  styleUrls: ['./saved-trips.component.css'],
  providers: [TripService],
  moduleId: module.id,
})
export class SavedTripsComponent implements OnInit {

  private savedTrips: Array<Trip>;

  constructor(private tripService: TripService) { 

  }

  ngOnInit() {
    this.savedTrips = this.tripService.getBookmarkedTrips();
  }

}
