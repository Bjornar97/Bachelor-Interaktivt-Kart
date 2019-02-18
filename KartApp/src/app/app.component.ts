import { Component, OnInit } from "@angular/core";
import { PanGestureEventData } from "tns-core-modules/ui/gestures/gestures";
import {screen} from "platform"
import { LocationClass } from "./location";
import { MainMap } from "./globals";

@Component({
    moduleId: module.id,
    selector: "ns-app",
    templateUrl: "app.component.html"
})
export class AppComponent { 
    
    constructor(){
        this.locationService = new LocationClass(1);
    }

    private locationService: LocationClass;
    private showLocationButton = true;

    private drawer = {
        startHeight: 100, // Brukt til å renge ut høyden ved endring i høyde.
        heightInt: 100,
        height: "100dp",
        visibility: "visibility: collapsed;",
        drawerClass: "drawer",
        maxHeight: screen.mainScreen.heightDIPs - 113,
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

    hideDrawer(){
        this.drawer.visibility = "visibility: collapsed;";
    }

    showDrawer(){
        this.drawer.visibility = "visibility: visible;";
    }

    closeDrawer(){
        this.hideDrawer()
        this.setSelectedButtons()
        this.showLocationButton = true;
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

        if (isPanning) {
            
        } else {
            // Når draweren er på toppen
            if (height > drawerLoc.maxHeight - 20){
                height = drawerLoc.maxHeight;
                drawerLoc.drawerClass = "drawerMaximized";
            }
            // Gjem draweren når den er dratt helt ned
            if (height < 10){
                this.closeDrawer();
            } else {
                drawerLoc.initialHeight = height;
            }
        }
        
        if (height >= drawerLoc.maxHeightLocationButton){
            this.showLocationButton = false;
        } else {
            this.showLocationButton = true;
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
            drawerLoc.heightInt = drawerLoc.startHeight - args.deltaY;
        }

        if (drawerLoc.heightInt < 0){
            drawerLoc.heightInt = 0;
        }

        console.log(screen.mainScreen.heightDIPs);

        if (drawerLoc.heightInt > drawerLoc.maxHeight){
            drawerLoc.heightInt = drawerLoc.maxHeight;
            console.log("Outside range!")
        }
        
        if (state === 3){
            // Sluppet
            // Når draweren er på toppen
            if (drawerLoc.heightInt > drawerLoc.maxHeight - 20){
                drawerLoc.heightInt = drawerLoc.maxHeight;
                drawerLoc.drawerClass = "drawerMaximized";
            }
            // Gjem draweren når den er dratt helt ned
            if (drawerLoc.heightInt < 10){
                this.hideDrawer();
                this.setSelectedButtons();
            } else {
                drawerLoc.initialHeight = drawerLoc.heightInt;
            }
        }
        
        if (drawerLoc.heightInt >= drawerLoc.maxHeightLocationButton){
            this.showLocationButton = false;
        } else {
            this.showLocationButton = true;
        }

        drawerLoc.height = drawerLoc.heightInt + "dp";
    }

    onButtonPress(buttonName, height = this.drawer.initialHeight){
        console.log("Going to " + buttonName, " Height: " + height);

        console.log(buttonName)
        if (this.isSelected(buttonName)){
            buttonName = null;
            this.closeDrawer();
        } else {
            this.showDrawer();
        }

        this.setSelectedButtons(buttonName);

        this.drawer.heightInt = height;
        
        if (this.drawer.heightInt > this.drawer.maxHeight) {
            this.drawer.heightInt = this.drawer.maxHeight;
            console.log("Outside range!");
        }

        if (this.drawer.heightInt === this.drawer.maxHeight) {
            this.drawer.drawerClass = "drawerMaximized";
        } else {
            this.drawer.drawerClass = "drawer";
        }

        this.drawer.height = this.drawer.heightInt + "dp";


        this.drawer.initialHeight = this.drawer.heightInt;
    }

    goToLocation(){
        MainMap.flyTo(16, 2000, true, undefined, 4000, 10000);
    }

    ngOnInit(): void {
        // Init your component properties here.
        
    }
}
