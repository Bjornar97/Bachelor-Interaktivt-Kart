import { Component, OnInit } from '@angular/core';
import { BackendService } from '../backend.service';
import { Page } from 'tns-core-modules/ui/page/page';
import { DrawerClass } from '~/app/drawer';
import * as globals from "../../globals";
import { RouterExtensions } from 'nativescript-angular/router';
import { SettingsClass } from '../../settings-page/settings';
import { Label } from 'tns-core-modules/ui/label/label';
import { GridLayout } from 'tns-core-modules/ui/layouts/grid-layout/grid-layout';

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
    private message: string;
    private newPasswordExpanded = false;
    private securePassword= true;
    private vellyket: string;


    constructor(private routerExtensions: RouterExtensions,private page: Page, private backendService: BackendService) {
        // Use the component constructor to inject providers.
        this.drawer = globals.getDrawer();
        page.actionBarHidden = true; 
        this.settingsClass = globals.getSettingsClass();
    }


    edit(phoneNumber,email){
        console.log("email: " + email + " phoneNumber: " + phoneNumber );
        this.backendService.edit(phoneNumber,email)
        .subscribe((result) => {
            let tokenSetting = this.settingsClass.getSetting(61);
        if (<any>result.status == 201){
            console.dir(result);
            tokenSetting.value = (<any>result).body.access_token;
            this.message = (<any>result).body.message;
            this.settingsClass.setSetting(tokenSetting);
        }else if (tokenSetting == undefined){
            tokenSetting = {
              id: 61,
              name: "tokenSetting",
              type: "token",
              value: undefined
            } 
        }else {
            this.message = "Noe gikk galt. Prøv igjen";
        }
        });
    }
    

    endrePassord(password){
        console.log("password: " + password);
        this.backendService.endrePassord(password)
        .subscribe((result) => {
            let tokenSetting = this.settingsClass.getSetting(61);
            if (tokenSetting == undefined){
              tokenSetting = {
                id: 61,
                name: "tokenSetting",
                type: "token",
                value: undefined
              }
            }
            else if (<any>result.status == 201) {
                this.message = "Du blei registrert";
            }
            console.dir(result);
            tokenSetting.value = (<any>result).body.access_token;
            this.vellyket = (<any>result).body.message;
            this.settingsClass.setSetting(tokenSetting);
        });
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