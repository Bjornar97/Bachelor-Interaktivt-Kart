import { Component, OnInit } from "@angular/core";
import { PanGestureEventData } from "tns-core-modules/ui/gestures/gestures";
import {screen} from "platform"

@Component({
    moduleId: module.id,
    selector: "ns-app",
    templateUrl: "app.component.html"
})
export class AppComponent { 
    
    private drawer = {
        startHeight: 100,
        heightInt: 100,
        height: "100dp",
        visibility: "visibility: collapsed;",
        drawerClass: "drawer",
        maxHeight: screen.mainScreen.heightDIPs - 113
    };

    onPan(args: PanGestureEventData) {
        console.log("Pan delta: [" + args.deltaX + ", " + args.deltaY + "] state: " + args.state);
        var state = args.state;
        var drawerLoc = this.drawer;
        if (state === 2) {
            drawerLoc.heightInt = drawerLoc.startHeight - args.deltaY;
        }

        drawerLoc.drawerClass = "drawer";

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
            // Gjem draweren når den er dratt helt ned
            if (drawerLoc.heightInt < 10){
                this.hideDrawer()
            }
            // Når draweren er på toppen
            if (drawerLoc.heightInt > drawerLoc.maxHeight - 20){
                drawerLoc.heightInt = drawerLoc.maxHeight;
                drawerLoc.drawerClass = "drawerMaximized";
            }
            drawerLoc.startHeight = drawerLoc.heightInt;
        }

        drawerLoc.height = drawerLoc.heightInt + "dp";
    }

    hideDrawer(){
        this.drawer.visibility = "visibility: collapsed;";
    }

    changeDrawer(dest, height = this.drawer.maxHeight){
        console.log("Going to " + dest, " Height: " + height);
        this.drawer.visibility = "visibility: visible;";
        // TODO: Navigation goes here


        

        this.drawer.heightInt = height;
        
        if (this.drawer.heightInt > this.drawer.maxHeight) {
            this.drawer.heightInt = this.drawer.maxHeight;
            console.log("Outside range!")
        }

        if (this.drawer.heightInt === this.drawer.maxHeight) {
            this.drawer.drawerClass = "drawerMaximized"
        } else {
            this.drawer.drawerClass = "drawer"
        }

        this.drawer.height = this.drawer.heightInt + "dp";
        this.drawer.startHeight = this.drawer.heightInt;
    }

    ngOnInit(): void {
        // Init your component properties here.
        
    }
}
