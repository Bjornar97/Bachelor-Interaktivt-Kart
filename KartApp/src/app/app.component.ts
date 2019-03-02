import { Component, OnInit } from "@angular/core";
import { PanGestureEventData } from "tns-core-modules/ui/gestures/gestures";
import {screen} from "platform"
import { LocationClass } from "./location";
import * as globals from "./globals";
import { SettingsService } from "./settings-page/settings.service";
import { RouterExtensions } from "nativescript-angular/router";
import * as fs from 'tns-core-modules/file-system';
import * as application from "tns-core-modules/application";
import * as dialogs from "tns-core-modules/ui/dialogs";
import { TripService } from "./home-page/trip.service";

@Component({
    moduleId: module.id,
    selector: "ns-app",
    templateUrl: "app.component.html",
    providers: [TripService]
})
export class AppComponent { 
    private settingsService;

    constructor(private routerExtensions: RouterExtensions){
        console.log("Creating app component!");
        this.locationService = new LocationClass(1);
        this.settingsService = new SettingsService();
        globals.setSettingsService(this.settingsService);
        this.tripService = new TripService();
    }

    private locationService: LocationClass;
    private tripService: TripService;
    private showLocationButton = true;

    private drawer = {
        startHeight: 100, // Brukt til å renge ut høyden ved endring i høyde.
        heightInt: 100,
        height: "100dp",
        visibility: "visibility: collapsed;",
        drawerClass: "drawer",
        maxHeight: screen.mainScreen.heightDIPs - 105,
        maxHeightLocationButton: screen.mainScreen.heightDIPs / 2,
        initialHeight: 200 // Høyden den husker og starter på når du åpner draweren.
    };

    private buttons = {
        home: {
            buttonClass: "button"
        },
        account: {
            buttonClass: "button"
        },
        settings: {
            buttonClass: "button"
        }
    };

    private hideDrawer(){
        this.drawer.visibility = "visibility: collapsed;";
    }

    private showDrawer(){
        this.drawer.visibility = "visibility: visible;";
    }

    closeDrawer(){
        this.hideDrawer()
        this.setSelectedButtons()
        this.showLocationButton = true;
    }

    openDrawer(height = this.drawer.initialHeight, buttonName?){
        this.showDrawer();
        this.setDrawerHeight(height);
        if (buttonName != undefined) {
            this.setSelectedButtons(buttonName);
        }
    }

    setDrawerHeight(height = 0, isPanning = false){
        var drawerLoc = this.drawer;

        if (height < 0){
            console.log("Drawer height below minimum range! Height: " + height + ", Minimum: 0")
            height = 0;
        }
        if (height > drawerLoc.maxHeight){
            console.log("Drawer height above maximum range! Height: " + height + ", Maximum: " + drawerLoc.maxHeight)
            height = drawerLoc.maxHeight;
        }

        if (!isPanning) {
            // Når draweren er på toppen
            if (height > drawerLoc.maxHeight - 20){
                height = drawerLoc.maxHeight;
                drawerLoc.drawerClass = "drawerMaximized";
            } else {
                drawerLoc.drawerClass = "drawer";
            }
            // Gjem draweren når den er dratt helt ned
            if (height < 10){
                this.closeDrawer();
            } else {
                drawerLoc.initialHeight = height;
            }
        }

        drawerLoc.heightInt = height;
        drawerLoc.height = height + "dp";
    }

    setSelectedButtons(selectedButton = null){
        // TODO: Iterate dict
        this.buttons.home.buttonClass = "button";
        this.buttons.account.buttonClass = "button";
        this.buttons.settings.buttonClass = "button";
        if (selectedButton) {
            if (selectedButton === "home") {
                this.buttons.home.buttonClass = "buttonSelected";
            } else if (selectedButton === "account") {
                this.buttons.account.buttonClass = "buttonSelected";
            } else if (selectedButton === "settings") {
                this.buttons.settings.buttonClass = "buttonSelected";
            }
        }
    }

    isSelected(buttonName){
        // TODO: Iterate dict
        if (buttonName === "home" && this.buttons.home.buttonClass === "buttonSelected") {
            return true;
        }
        if (buttonName === "account" && this.buttons.account.buttonClass === "buttonSelected") {
            return true;
        }
        if (buttonName === "settings" && this.buttons.settings.buttonClass === "buttonSelected") {
            return true;
        }
        return false;
    }

    onPan(args: PanGestureEventData){
        console.log("Pan delta: [" + args.deltaX + ", " + args.deltaY + "] state: " + args.state);
        var state = args.state;
        var drawerLoc = this.drawer;
        if (state === 1) {
            // Første trykk
            drawerLoc.drawerClass = "drawer";
            drawerLoc.startHeight = drawerLoc.heightInt;
        }
        if (state === 2) {
            // Mens den er holdt
            this.setDrawerHeight(drawerLoc.startHeight - args.deltaY, true);
        }
        if (state === 3){
            // Sluppet
            this.setDrawerHeight(drawerLoc.startHeight - args.deltaY);
        }
    }

    onButtonPress(buttonName, height = this.drawer.initialHeight){
        console.log("Pressed button: " + buttonName, " Height: " + height);

        if (this.isSelected(buttonName)){
            this.closeDrawer();
        } else {
            this.openDrawer(height, buttonName);
        }
    }

    goToLocation(){
        console.log("Going to location");
        globals.MainMap.getCenter().then((center) => {
            var centerPoint = this.locationService.newPoint(new Date(), center.lat, center.lng, 0);
            this.locationService.getLocation(5000, 5000, 1).then((location) => {
                var distance = this.locationService.findDistance(centerPoint, location);
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
            this.routerExtensions.navigate([urlArray[0]], {transition: {name: "slideRight"}});
        }
    }

    ngOnInit(): void {
        // When back button on android is pressed, check if you are on startpage, and promt you if you want to shut the app down.
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
        console.log("Innitting app component!");
        // Init your component properties here.

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
    }
}
