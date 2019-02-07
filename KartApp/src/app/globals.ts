import { MapComponent } from "./map/map.component";

//The main map of the application.
export var MainMap: MapComponent;
export var buttons: Object;

// A function for setting the main map.
export function setMap(map){
    MainMap = map;
}