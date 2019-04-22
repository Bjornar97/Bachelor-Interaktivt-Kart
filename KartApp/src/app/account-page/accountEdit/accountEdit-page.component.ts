import { Component, OnInit } from '@angular/core';
import { BackendService } from '../backend.service';
import { SettingsService } from '../../settings-page/settings.service';
import { Page } from 'tns-core-modules/ui/page/page';
import { DrawerClass } from '~/app/drawer';
import * as globals from "../../globals";
import { RouterExtensions } from 'nativescript-angular/router';
import { SettingsClass } from '../../settings-page/settings';

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


    constructor(private routerExtensions: RouterExtensions,private page: Page, private backendService: BackendService, private settingsService: SettingsService) {
        // Use the component constructor to inject providers.
        this.drawer = globals.getDrawer();
        page.actionBarHidden = true; 
        this.settingsClass = globals.getSettingsClass();
    }


    edit(username,phoneNumber,email){
        console.log("email: " + email + " phoneNumber: " + phoneNumber + "username" + username);
        this.backendService.edit(username,phoneNumber,email)
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
        }else if (<any>result.status == 404){
            this.message = "Brukernavnet finnes ikke i databasen";
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
            console.dir(result);
            tokenSetting.value = (<any>result).body.access_token;
            this.message = (<any>result).body.message;
            this.settingsClass.setSetting(tokenSetting);
        });
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