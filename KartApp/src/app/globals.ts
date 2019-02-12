import { MapComponent } from "./map/map.component";
import { Tracker } from "./tracker";

//The main map of the application.
export var MainMap: MapComponent;

// A function for setting the main map.
export function setMap(map){
    MainMap = map;
}

// Comment about this here
export var buttons: Object;


// Tracker
export var MainTracker: Tracker;

export function setTracker(tracker: Tracker) {
    
}