import { Component, OnInit, OnDestroy } from "@angular/core";
import { LocationClass } from "./location";
import * as globals from "./globals";
import { Setting, SettingsClass } from "./settings-page/settings";
import { RouterExtensions } from "nativescript-angular/router";
import * as fs from 'tns-core-modules/file-system';
import * as application from "tns-core-modules/application";
import * as dialogs from "tns-core-modules/ui/dialogs";
import { TripService } from "./home-page/trip.service";
import { isAndroid } from "tns-core-modules/platform";
import { DrawerClass } from "~/app/drawer";

@Component({
    moduleId: module.id,
    selector: "ns-app",
    templateUrl: "app.component.html",
    providers: [TripService]
})
export class AppComponent implements OnInit, OnDestroy {
    private drawer: DrawerClass;

    constructor(private routerExtensions: RouterExtensions, private tripService: TripService){
        console.log("Creating app component!");
        this.locationService = new LocationClass(1);
        this.drawer = globals.getDrawer();
        globals.setRouterExtensions(this.routerExtensions);
        this.settingsClass = globals.getSettingsClass();
    }

    private locationService: LocationClass;
    private settingsClass: SettingsClass;

    goToLocation(){
        console.log("Going to location");
        globals.MainMap.getCenter().then((center) => {
            var centerPoint = this.locationService.newPoint(new Date(), center.lat, center.lng, 0);
            this.locationService.getLocation(5000, 5000, 1).then((location) => {
                var distance = LocationClass.findDistance(centerPoint, location);
                var duration = Math.abs(Math.log10(distance)*10);
                globals.MainMap.getZoom().then((zoom) => {
                    var zoomlevel;
                    var altitude;
                    if (zoom < 14){
                        if (duration < 4000){
                            duration += (16 - zoom)*500;
                        }
                        if (distance < 200){
                            zoomlevel = 14;
                            altitude = 4000;
                        } else {
                            zoomlevel = 16;
                            altitude = 2000;
                        }
                    } else {
                        altitude = (20 - zoom)*700;
                        if (distance < 100000){
                            if (distance < 10){
                                duration = (distance/(zoom))*((zoom-14)*10)^3;
                            } else {
                                duration = 300 + (distance/(zoom))*((zoom-14)*10)^3;
                            }
                        } else {
                            duration = 4000;
                        }
                        if (distance > 500){
                            zoomlevel = 16;
                        } else {
                            zoomlevel = zoom;
                        }
                    }
                    if (duration > 4000){
                        duration = 4000;
                    }

                    console.log("Finished calculations: duration: " + duration + ", zoom: " + zoomlevel + ", altitude: " + altitude);
                    globals.MainMap.flyTo(zoomlevel, altitude, true, Math.round(duration), 1000, location);
                });
            });
        });
    }

    backBtnPress(){
        if (this.routerExtensions.canGoBackToPreviousPage()){
            this.routerExtensions.back();
        } else {
            var url = this.routerExtensions.router.url;
            var urlArray = url.split("/");
            this.routerExtensions.navigate([urlArray[1]], {transition: {name: "slideRight"}, clearHistory: true});
        }
    }

    
    /**
     * Check if the previous trip was finished. If it wasnt, load the trip into the tracker so it can continue.
     */
    private checkPrevTrip(){
        if (this.tripService.isTrip()){
            console.log("A trip is ongoing already!")
            return;
        }
        try {
            // Check if a trip is currently going on when opening the app:
            let folder = fs.knownFolders.documents().getFolder("Trips");
                // Getting the file
            let file = folder.getFile("CurrentTrip.json");
            let result = JSON.parse(file.readTextSync());
            
            // Checking if the last trip was finished
            if (!this.tripService.doesTripExist(result.trip.id)){
                console.log("Prev trip not finsihed, resuming trip");
                globals.MainTracker.loadTrip(result.trip);
                this.routerExtensions.navigateByUrl("home/currentTrip").then((value) => {
                    if (value){
                        console.log("Navigation succeded");
                        this.drawer.openDrawer(undefined, "home");
                    }
                });
            } else {
                console.log("Trip exists already: ");
            }
            
            let tripActive = this.settingsClass.getSetting(41);
            console.log("TripActive: " + tripActive.value);
            if (tripActive.value) {
                this.tripService.unpauseTrip();
            }
        } catch (error) {
            console.log("There was an error while resuming previous trip");
            console.log(error);
        }   
    }

    ngOnDestroy() {
        this.settingsClass.saveSettings();
    }

    ngOnInit(): void {
        // When back button on android is pressed, check if you are on startpage, and promt you if you want to shut the app down.
        if (isAndroid) {
            application.android.on(application.AndroidApplication.activityBackPressedEvent, (args: any) => {
                var url = this.routerExtensions.router.url;
                var path = url.split("/");
                console.log("Path: " + path + " length: " + path.length);
                if (path.length <= 2){
                    // Check if drawer is open, and close it instead of stopping the app.
                    args.cancel = true;
                    let options = {
                        title: "Avslutte appen?",
                        message: "Vil du avslutte appen? \nDersom du er på en tur vil dette føre til at denne settes på pause, og vil ikke fortsette før du åpner appen og starter turen igjen.",
                        okButtonText: "Ja",
                        cancelButtonText: "Nei",
                        neutralButtonText: "Avbryt"
                      };
                    dialogs.confirm(options).then((result) => {
                        if (result){
                            if (this.tripService.isTrip()){
                                this.tripService.pauseTrip();
                            }
                            application.android.foregroundActivity.finish();
                        }
                    });
                }
            });
        }

        // Adding files and folders that doesnt exist:
        var tripFolder = fs.knownFolders.documents().getFolder("Trips");
        if (!fs.File.exists(fs.path.join(tripFolder.path, "Info.json"))){
            console.log("Adding file: Info.json");
            var file = tripFolder.getFile("Info.json");
            var info = {
                lastTripID: 0,
                ids: []
            }
            file.writeTextSync(JSON.stringify(info));
        }

        this.checkPrevTrip();

        console.log("App component initiallized");
    }
}