import { MapComponent } from "./map/map.component";
import { Tracker, Trip } from "./tracker";
import { Setting, SettingsClass } from "./settings-page/settings";
import { RouterExtensions } from "nativescript-angular/router";
import { DrawerClass } from "~/app/drawer";
import { CurrentTripPageComponent } from "./home-page/current-trip-page/current-trip-page.component";

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
export var settingsClass: SettingsClass = undefined;

export function getSettingsClass(){
    if (settingsClass == undefined){
        settingsClass = new SettingsClass();
    }
    return settingsClass;
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

// Remembering home page
var CurrentHomePage: string = "home";

export function getCurrentHomePage(){
    return CurrentHomePage;
}

export function setCurrentHomePage(currentHomePage: string) {
    CurrentHomePage = currentHomePage;
}

// Error list
var errorList: string[] = [];

export function getErrorList(){
    return errorList;
}

export function showError(errorString: string) {
    errorList.push(errorString);
    setTimeout(() => {
        this.counter--;
        errorList.splice(0, 1);
    }, 5000);
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
    let hours = date.getHours() < 10 ? '0' + date.getHours(): date.getHours();
    let minutes = date.getMinutes() < 10 ? '0' + date.getMinutes(): date.getMinutes();
    if (now.getTime() - date.getTime() < 48*60*60*1000){
        let dateDay = date.getDay();
        let nowDay = now.getDay();
        if (now.getDay() == date.getDay()){
            return "I dag kl. " + hours + ":" + minutes;
        } else {
            if((nowDay == 0 && dateDay == 6) || dateDay == nowDay - 1){
                return "I går kl. " + hours + ":" + minutes;
            }
        }
    }
    return date.getDate() + "." + months[date.getMonth()] + "." + "kl. " + hours + ":" + minutes;

  }

  var CheckboxList: boolean[] = [];
  
  export function getCheckboxList(id: number){
    if (CheckboxList[id] == undefined){
      console.log("Creating CheckboxList entry");
      CheckboxList[id] = false;
    }
    return CheckboxList[id];
  }

  export function setCheckboxList(id: number, value: boolean){
    CheckboxList[id] = value;
  }

  // Current friends-trip
  export var CurrentTrip: Trip;

  export function setCurrentTrip(currentTrip) {
      CurrentTrip = currentTrip;
  }