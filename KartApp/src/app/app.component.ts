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

    onPan(args: PanGestureEventData) {
        console.log("Pan delta: [" + args.deltaX + ", " + args.deltaY + "] state: " + args.state);
        var state = args.state;
        var drawerLoc = this.drawer;
        if (state === 2) {
            drawerLoc.heightInt = drawerLoc.startHeight - args.deltaY;
        }

        if (drawerLoc.heightInt < 10){
            drawerLoc.heightInt = 0;
        }

        console.log(screen.mainScreen.heightDIPs);

        if (drawerLoc.heightInt > screen.mainScreen.heightDIPs - 115){
            drawerLoc.heightInt = screen.mainScreen.heightDIPs - 115;
            console.log("Outside range!")
        }
        
        if (state === 3){
            // Sluppet
            drawerLoc.startHeight = drawerLoc.heightInt;
        }

        drawerLoc.height = drawerLoc.heightInt + "dp";
    }

    change(dest, height = screen.mainScreen.heightDIPs - 115){
        console.log("Going to " + dest, " Height: " + height);
        this.drawer.visibility = "visibility: visible;";
        this.drawer.heightInt = height;
        this.drawer.height = this.drawer.heightInt + "dp";
        this.drawer.startHeight = height;
    }

    ngOnInit(): void {
        // Init your component properties here.
        
    }
}
