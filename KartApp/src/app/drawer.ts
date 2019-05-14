import * as globals from "./globals";
import { screen } from "tns-core-modules/platform";
import { SettingsClass, Setting } from "./settings-page/settings";
import { PanGestureEventData } from "tns-core-modules/ui/gestures/gestures";
import { RouterExtensions } from "nativescript-angular/router/router-extensions";


export class DrawerClass {

    private settingsClass: SettingsClass;
    private drawerSetting: Setting;

    constructor() {
        this.settingsClass = globals.getSettingsClass();

        // Getting the drawer from settings
        var drawersetting: Setting = this.settingsClass.getSetting(48);
        console.dir(this.drawerSetting);
        if (drawersetting != undefined){
            this.drawer.initialHeight = drawersetting.value;
            this.drawerSetting = drawersetting;
        } else {
            drawersetting = {
                id: 48,
                name: "drawerSetting",
                type: "Object",
                value: this.drawer.initialHeight
            }
            console.log("DrawerSetting does not exist");
            this.settingsClass.setSetting(drawersetting);
            this.drawerSetting = drawersetting;
        }
    }

    public drawer = {
        startHeight: 100, // Brukt til å regne ut høyden ved endring i høyde.
        heightInt: 100,
        height: "100dp",
        visibility: "visibility: collapsed;",
        drawerClass: "drawer",
        maxHeight: screen.mainScreen.heightDIPs - 105,
        initialHeight: 200, // Høyden den husker og starter på når du åpner draweren.
        previousHeight: 100, // For bruk i filtrering.
        filterHeightAlpha: 0.7, // Konstant mellom 0 og 1 for bruk i filtrering.
        currentTime: null,
        previousTime: null,
        previousSpeed: 0,
        currentSpeed: 0,
        filterSpeedAlpha: 0.7
    };

    public buttons = {
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

    public closeDrawer(){
        this.hideDrawer();
        this.setSelectedButtons();
    }

    public openDrawer(height = this.drawer.initialHeight, buttonName?){
        this.showDrawer();
        this.setDrawerHeight(height);
        if (buttonName != undefined) {
            this.setSelectedButtons(buttonName);
        }
    }

    public getMaxHeight(){
        return this.drawer.maxHeight;
    }

    public setDrawerHeight(height = this.drawer.maxHeight, isPanning = false){
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

            // Saving the state of the drawer. Subject to change
            if (this.drawerSetting != undefined){
                this.drawerSetting.value = this.drawer.initialHeight;
                this.settingsClass.setSetting(this.drawerSetting);
            } else {
                console.log("ERROR in drawer: Could not set setting drawerSetting, because it is not defined");
            }
        }

        drawerLoc.heightInt = height;
        drawerLoc.height = height + "dp";
    }

    public setSelectedButtons(selectedButton = null){
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

    private isSelected(buttonName){
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

    private getFilteredHeight(){
        var drawerLoc = this.drawer;
        return drawerLoc.filterHeightAlpha * drawerLoc.heightInt + (1 - drawerLoc.filterHeightAlpha) * drawerLoc.previousHeight;
    }

    private getDrawerSpeed(){
        // DIP per milisecond
        var drawerLoc = this.drawer;
        if (drawerLoc.currentTime == drawerLoc.previousTime) {
            return 0;
        }
        return (this.getFilteredHeight() - drawerLoc.previousHeight)/(drawerLoc.currentTime - drawerLoc.previousTime);
    }

    private getFilteredDrawerSpeed(){
        var drawerLoc = this.drawer;
        return drawerLoc.filterSpeedAlpha * this.getDrawerSpeed() + (1 - drawerLoc.filterSpeedAlpha) * drawerLoc.previousSpeed;
    }

    public onPan(args: PanGestureEventData){
        console.log("Pan delta: [" + args.deltaX + ", " + args.deltaY + "] state: " + args.state);
        var state = args.state;
        var drawerLoc = this.drawer;
        if (state === 1) {
            // Første trykk
            drawerLoc.drawerClass = "drawer";
            drawerLoc.startHeight = drawerLoc.heightInt;
            drawerLoc.previousHeight = drawerLoc.heightInt;
            drawerLoc.previousTime = drawerLoc.currentTime;
            drawerLoc.previousSpeed = 0;
        }
        if (state === 2) {
            // Mens den er holdt
            drawerLoc.previousHeight = this.getFilteredHeight();
            this.setDrawerHeight(drawerLoc.startHeight - args.deltaY, true);
            drawerLoc.previousTime = drawerLoc.currentTime;
            drawerLoc.currentTime = Date.now();
            drawerLoc.previousSpeed = drawerLoc.currentSpeed;
            drawerLoc.currentSpeed = this.getFilteredDrawerSpeed();
        }
        if (state === 3){
            // Sluppet
            console.log("Speed: " + drawerLoc.currentSpeed);
            if (drawerLoc.currentSpeed > 2.2) { // Endre på tallet for å endre på grensen for maksimering.
                this.setDrawerHeight();
            } else if (drawerLoc.currentSpeed < -2.2) { // Endre på tallet for å endre på grensen for minimering.
                this.setDrawerHeight(0);
            } else if (Math.abs(drawerLoc.currentSpeed) > 0.2) {
                this.setDrawerHeight(drawerLoc.startHeight - args.deltaY + (drawerLoc.currentSpeed * 70));
            } else {
                this.setDrawerHeight(drawerLoc.startHeight - args.deltaY);
            }
        }
    }

    public onButtonPress(buttonName, height = this.drawer.initialHeight){
        console.log("Pressed button: " + buttonName, " Height: " + height);

        if (this.isSelected(buttonName)){
            this.closeDrawer();
        } else {
            this.openDrawer(height, buttonName);
            if (buttonName == "home") {
                try {
                    globals.routerExtensions.navigate([globals.getCurrentHomePage()], {
                        animated: true,
                        clearHistory: true,
                        transition: {
                          name: "fade"
                        }
                    });
                } catch (error) {
                    globals.routerExtensions.navigate(["home"], {
                        animated: true,
                        clearHistory: true,
                        transition: {
                          name: "fade"
                        }
                    });
                }
            } else if (buttonName == "account") {
                try {
                    let token = this.settingsClass.getSetting(61).value;
                    if (token == undefined) {
                        console.log("Token is undefined in drawer");
                        globals.routerExtensions.navigate(["account/login"], {
                            animated: true,
                            clearHistory: true,
                            transition: {
                                name: "fade"
                            }
                        });
                    } else if (token.value != undefined) {
                        console.log("Token is not undefined in drawer");
                        globals.routerExtensions.navigate(["account"], {
                            animated: true,
                            clearHistory: true,
                            transition: {
                                name: "fade"
                            }
                        });
                    } else {
                        console.log("Token is undefined in drawer");
                        globals.routerExtensions.navigate(["account/login"], {
                            animated: true,
                            clearHistory: true,
                            transition: {
                                name: "fade"
                            }
                        });
                    }
                } catch (error) {
                    console.log("ERROR in drawer while finding token");
                    globals.routerExtensions.navigate(["account", "login"], {
                        animated: true,
                        clearHistory: true,
                        transition: {
                            name: "fade"
                        }
                    });
                }
            }
        }
    }
}