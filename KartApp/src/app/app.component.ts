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
        visibility: "visibility: collapsed;"
    };

    private topHeight = 113

    onPan(args: PanGestureEventData) {
        console.log("Pan delta: [" + args.deltaX + ", " + args.deltaY + "] state: " + args.state);
        var state = args.state;
        var drawerLoc = this.drawer;
        if (state === 2) {
            drawerLoc.heightInt = drawerLoc.startHeight - args.deltaY;
        }

        if (drawerLoc.heightInt < 0){
            drawerLoc.heightInt = 0;
        }

        console.log(screen.mainScreen.heightDIPs);

        if (drawerLoc.heightInt > screen.mainScreen.heightDIPs - this.topHeight){
            drawerLoc.heightInt = screen.mainScreen.heightDIPs - this.topHeight;
            console.log("Outside range!")
        }
        
        if (state === 3){
            // Sluppet
            // Gjem draweren når den er dratt helt ned
            if (drawerLoc.heightInt < 10){
                this.hideDrawer()
            }
            // Når draweren er på toppen
            if (drawerLoc.heightInt > screen.mainScreen.heightDIPs - this.topHeight - 20){
                drawerLoc.heightInt = screen.mainScreen.heightDIPs - this.topHeight;
                console.log("Outside range!")
            }
            drawerLoc.startHeight = drawerLoc.heightInt;
        }

        drawerLoc.height = drawerLoc.heightInt + "dp";
    }

    hideDrawer(){
        this.drawer.visibility = "visibility: collapsed;";
    }

    changeDrawer(dest, height = screen.mainScreen.heightDIPs - 113){
        console.log("Going to " + dest, " Height: " + height);
        this.drawer.visibility = "visibility: visible;";
        // TODO: Navigation goes here


        

        this.drawer.heightInt = height;
        this.drawer.height = this.drawer.heightInt + "dp";
        this.drawer.startHeight = height;
    }

    ngOnInit(): void {
        // Init your component properties here.
        
    }
}
