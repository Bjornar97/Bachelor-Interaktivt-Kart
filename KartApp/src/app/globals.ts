import { MapComponent } from "./map/map.component";
import { Tracker } from "./tracker";
import { SettingsService, Setting } from "./settings-page/settings.service";
import { RouterExtensions } from "nativescript-angular/router";
import { DrawerClass } from "~/app/drawer";

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

// Drawer
var Drawer: DrawerClass;

export function getDrawer(){
    if (Drawer == undefined){
        console.log("Creating drawer");
        Drawer = new DrawerClass();
    } 
    return Drawer;
}

// Time 
/**
   * timeConversion - Converts time in milliseconds to a readable string in this format: hh:mm:ss. If less than one hour: mm:ss
   * 
   * @param millisec The total time in milliseconds
   */
  export function timeConversion(millisec) {
    var totalTime = millisec;

    var totalHours = Math.floor(totalTime / 3600000);
    var totalMinutes = Math.floor((totalTime % 3600000) / 60000);
    var totalSeconds = Math.floor((totalTime % 60000) / 1000);

    var hrs = (totalHours < 10) ? ("0" + totalHours) : totalHours;
    var min = (totalMinutes < 10) ? ("0" + totalMinutes) : totalMinutes;
    var sec = (totalSeconds < 10) ? ("0" + totalSeconds) : totalSeconds;
    
    if (totalHours < 1) {
        return min + ":" + sec;
    } else {
        return hrs + ":" + min + ":" + sec;
    }
  }

  var months = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Des"];

  export function timeMaker(date: Date): string{
    let now = new Date();
    if (now.getTime() - date.getTime() < 48*60*60*1000){
        let dateDay = date.getDay();
        let nowDay = now.getDay();
        if (now.getDay() == date.getDay()){
            return "I dag kl. " + date.getHours() + ":" + date.getMinutes();
        } else {
            if((nowDay == 0 && dateDay == 6) || dateDay == nowDay - 1){
                return "I går kl. " + date.getHours() + ":" + date.getHours();
            }
        }
    }
    return date.getDate() + "." + months[date.getMonth()] + "." + "kl. " + date.getHours() + ":" + date.getHours();

  }