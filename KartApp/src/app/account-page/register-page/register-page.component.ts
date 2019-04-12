import { Component, OnInit } from '@angular/core';
import { BackendService } from '../backend.service';
import { SettingsClass } from '../../settings-page/settings';
import { Page } from 'tns-core-modules/ui/page/page';
import { DrawerClass } from '~/app/drawer';
import * as globals from "../../globals";
import { RouterExtensions } from 'nativescript-angular/router';

@Component({
    moduleId: module.id,
    selector: "ns-register-page",
    templateUrl: "register-page.component.html",
    styleUrls: ['./register-page.component.css'],
    providers: [BackendService]
})
export class RegisterPageComponent {
    private drawer: DrawerClass;
    private settingsClass: SettingsClass;
    private username: string;


    constructor(private routerExtensions: RouterExtensions,private page: Page, private backendService: BackendService) {
        // Use the component constructor to inject providers.
        this.drawer = globals.getDrawer();
        page.actionBarHidden = true; 
        this.settingsClass = globals.getSettingsClass();
    }

    register(username,phoneNumber,loginName, password){
        console.log("email: " + loginName + " passord: " + password + "telNummer" +phoneNumber + "username" + username);
        this.backendService.register(username,phoneNumber,loginName, password)
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
          this.username = (<any>result).body.message;
          this.settingsClass.setSetting(tokenSetting);
        });
    }


    private goBack(){
        this.routerExtensions.navigate(["account", "login"], {
          animated: true,
          clearHistory: true,
          transition: {
            name: "slideRight"
          }
        });
    }
}