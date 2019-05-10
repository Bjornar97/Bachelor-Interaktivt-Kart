import { Component, OnInit } from '@angular/core';
import { BackendService } from '../backend.service';
import { Page } from 'tns-core-modules/ui/page/page';
import { DrawerClass } from '~/app/drawer';
import * as globals from "../../globals";
import { RouterExtensions } from 'nativescript-angular/router';
import { SettingsClass } from '../../settings-page/settings';
import { Label } from 'tns-core-modules/ui/label/label';
import { GridLayout } from 'tns-core-modules/ui/layouts/grid-layout/grid-layout';
import { isIOS, isAndroid } from "tns-core-modules/platform";
import * as frame from "tns-core-modules/ui/frame";
import * as utils from "tns-core-modules/utils/utils";

@Component({
    moduleId: module.id,
    selector: "ns-accountEdit-page",
    templateUrl: "accountEdit-page.component.html",
    styleUrls: ['./accountEdit-page.component.css'],
    providers: [BackendService]
})
export class AccountEditPageComponent  {
    private drawer: DrawerClass;
    private settingsClass: SettingsClass;
    private newPasswordExpanded = false;
    private securePassword= true;
    private resultMessage: string;
    private checkColor=true;

    constructor(private routerExtensions: RouterExtensions,private page: Page, private backendService: BackendService) {
        // Use the component constructor to inject providers.
        this.drawer = globals.getDrawer();
        page.actionBarHidden = true; 
        this.settingsClass = globals.getSettingsClass();
    }


    edit(phoneNumber,email){
        this.resultMessage = "";
        console.log("email: " + email + " phoneNumber: " + phoneNumber );
        this.backendService.edit(phoneNumber,email)
        .subscribe((result) => {
            let tokenSetting = this.settingsClass.getSetting(61);
        if (<any>result.status == 201){
            this.resultMessage = "Bruker ble endret";
            this.checkColor=false;
            console.dir(result); 
        }else {
            this.resultMessage = "Noe gikk galt. Prøv igjen";
            this.checkColor=true;
        }
        });
    }
    
    dismissSoftKeybaord(){
        if (isIOS) {
            frame.topmost().nativeView.endEditing(true);
        }
        if (isAndroid) {
            utils.ad.dismissSoftInput();
        }
    }
    
    endrePassord(password, password2){
        this.resultMessage = "";
        console.log("Pass1: " + password + ", pass2: " + password2)
        if (password != password2){
            console.log("Ikke like")
            this.resultMessage="Passordene skal være like!"
            this.checkColor=true;
            console.log("password: " +password2);
        }else if(password == password2){
            this.backendService.endrePassord(password)
            .subscribe((result) => {
                console.dir(result);
                if (<any>result.status == 201) {
                    this.resultMessage = "Endring av passord var vellykket!";
                    this.checkColor=false;
                } else {
                    this.resultMessage = "Kunne ikke endre passord!";
                    this.checkColor=true;
                }
            });
        }
    }
    
    expendNewPassword(arrow: Label, box: GridLayout){
        console.log("Expanding");
        if (!this.newPasswordExpanded){
            arrow.animate({
                rotate: 180,
                duration: 250
            }).then(() => {
                let height = 100;
                let interval = setInterval(() => {
                    if (height >= 120){
                        box.set("height", "80dp");
                        this.newPasswordExpanded = true;
                        clearInterval(interval);
                    }
                    height += 5;
                    box.set("height", height + "dp");
                }, 5);
                
            });
        } else {
            arrow.animate({
                rotate: 0,
                duration: 250
            }).then(() => {
                let height = 120;
                let interval = setInterval(() => {
                    if (height <= 100){
                        box.set("height", "60dp");
                        this.newPasswordExpanded = false;
                        clearInterval(interval);
                    }
                    height -= 5;
                    box.set("height", height + "dp");
                }, 5);
            });
        }
    }

    toggleShow() {
        this.securePassword = !this.securePassword;
      }
    
    private goBack(){
        this.routerExtensions.navigate(["account"], {
          animated: true,
          clearHistory: true,
          transition: {
            name: "slideRight"
          }
        });
    }

}