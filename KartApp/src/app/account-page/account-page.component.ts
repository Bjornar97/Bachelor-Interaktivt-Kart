import { Component, OnInit } from '@angular/core';
import { Page } from 'tns-core-modules/ui/page/page';
import { DrawerClass } from '~/app/drawer';
import { BackendService } from './backend.service';
import { SettingsService } from '../settings-page/settings.service';
import * as globals from "../globals";
import { RouterExtensions } from 'nativescript-angular/router/router-extensions';


@Component({
    moduleId: module.id,
    selector: "ns-account-page",
    templateUrl: "account-page.component.html",
    styleUrls: ['./account-page.component.css'],
    providers: [BackendService]
})
 
export class AccountPageComponent {

    private drawer: DrawerClass;
    private username: string;


    constructor(private page: Page, private backendService: BackendService, private settingsService: SettingsService, private routerExtensions: RouterExtensions) {
        // Use the component constructor to inject providers.
        this.drawer = globals.getDrawer();
        page.actionBarHidden = true; 

        let token = this.settingsService.getSetting(undefined, 61);
        if (token == undefined) {
            console.log("TokenSetting is undefined");
            this.routerExtensions.navigate(["account", "login"], {
                animated: true,
                clearHistory: true,
                transition: {
                    name: "slideRight"
                }
            });
        } else if (token.value == undefined){
            console.log("Token is undefined");
            this.routerExtensions.navigate(["account", "login"], {
                animated: true,
                clearHistory: true,
                transition: {
                    name: "slideRight"
                }
            });
        } else {
            console.log("Token is defined");
            try {
                this.backendService.getInfo()
                .subscribe((result) => {
                    console.dir(<any>result);
                    if(<any>result.status == 202){
                        this.userInfo = (<any>result).body.username
                    } else {
                        this.routerExtensions.navigate(["account", "login"], {
                            animated: true,
                            clearHistory: true,
                            transition: {
                                name: "slideRight"
                            }
                        });
                    }
                });
            } catch (error) {
                console.log("Error while getting username: " + error);
                this.routerExtensions.navigate(["account", "login"], {
                    animated: true,
                    clearHistory: true,
                    transition: {
                        name: "slideRight"
                    }
                });
            }
            
        }
    }

    private userInfo;

    logOut(){
        let tokenSetting = this.settingsService.getSetting(undefined, 61);
        this.backendService.logOut()
        .subscribe((result) => {
            console.dir(result);
            if (<any>result.status == 200 || <any>result.status == 401){
                if (tokenSetting == undefined){
                    tokenSetting = {
                    id: 61,
                    name: "tokenSetting",
                    type: "token",
                    value: undefined
                    }
                    tokenSetting.value=undefined;
                    this.settingsService.setSetting(tokenSetting);
                }
                this.routerExtensions.navigate(["account", "login"], {
                    animated: true,
                    clearHistory: true,
                    transition: {
                        name: "slideRight"
                    }
                });
            } else {

            }
        });
    }

}