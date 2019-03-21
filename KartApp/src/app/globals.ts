import { MapComponent } from "./map/map.component";
import { Tracker } from "./tracker";
import { SettingsService, Setting } from "./settings-page/settings.service";
import { RouterExtensions } from "nativescript-angular/router";

//The main map of the application.
export var MainMap: MapComponent;

// A function for setting the main map.
export function setMap(map){
    MainMap = map;
}

export function getMap(){
    return MainMap
}

export var routerExtensions: RouterExtensions;

export function setRouterExtensions(routerExt: RouterExtensions){
    routerExtensions = routerExt;
}

// Comment about this here
export var buttons: Object;

// Settings Service
export var settingsService: SettingsService;

export function setSettingsService(service: SettingsService){
    settingsService = service;
}

// Tracker
export var MainTracker: Tracker;

export function getTracker(){
    return MainTracker;
}

export function setTracker(tracker: Tracker) {
    MainTracker = tracker;
}

// Settings
export var SettingsList: Setting[];