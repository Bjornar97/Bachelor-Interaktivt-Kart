import { Component, OnInit } from '@angular/core';
import { Page } from 'tns-core-modules/ui/page/page';
import { DrawerClass } from '~/app/drawer';
import { BackendService } from './backend.service';
import { SettingsClass } from '../settings-page/settings';
import * as globals from "../globals";
import { RouterExtensions } from 'nativescript-angular/router/router-extensions';


@Component({
    moduleId: module.id,
    selector: "ns-account-page",
    templateUrl: "account-page.component.html",
    styleUrls: ['./account-page.component.css'],
    providers: [BackendService]
})
 
export class AccountPageComponent implements OnInit{

    private drawer: DrawerClass;
    private username: string;
    private settingsClass: SettingsClass;
    private loading = true;

    constructor(private page: Page, private backendService: BackendService, private routerExtensions: RouterExtensions) {
        // Use the component constructor to inject providers.
        this.drawer = globals.getDrawer();
        page.actionBarHidden = true; 
        this.settingsClass = globals.getSettingsClass();
    }

    loadUsername() {
        this.loading = true;
        let token = this.settingsClass.getSetting(61);
        if (token.value == undefined){
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
                let request = this.backendService.getInfo()
                .subscribe((result) => {
                    console.dir(<any>result);
                    if(<any>result.status == 202){
                        this.username = (<any>result).body.username;
                        this.loading = false;
                    } else {
                        this.routerExtensions.navigate(["account", "login"], {
                            animated: true,
                            clearHistory: true,
                            transition: {
                                name: "slideRight"
                            }
                        });
                        this.loading = false;
                    }
                });
                setTimeout(() => {
                    if (this.loading) {
                        this.username = "Kunne ikke hente brukernavn";
                        request.unsubscribe();
                        this.loading = false;
                    }
                }, 10000);
            } catch (error) {
                this.loading = false;
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

    private logoutLoading = false;

    logOut(){   
        this.logoutLoading = true;
        try {
            let tokenSetting = this.settingsClass.getSetting(61);
            this.backendService.logOut()
                .subscribe((result) => {
                    console.dir(result);
                    if (<any>result.status == 200 || <any>result.status == 401){
                        tokenSetting.value = undefined;
                        this.settingsClass.setSetting(tokenSetting);
                        this.routerExtensions.navigate(["account", "login"], {
                            animated: true,
                            clearHistory: true,
                            transition: {
                                name: "slideRight"
                            }
                        });
                        this.logoutLoading = false;
                    }
                });
        } catch (error) {
            let tokenSetting = this.settingsClass.getSetting(61);
            tokenSetting.value = undefined;
            this.settingsClass.setSetting(tokenSetting);
        }
        setTimeout(() => {
            if (this.logoutLoading) {
                this.logoutLoading = false;
                let tokenSetting = this.settingsClass.getSetting(61);
                tokenSetting.value = undefined;
                this.settingsClass.setSetting(tokenSetting);
                
                this.routerExtensions.navigate(["account", "login"], {
                    animated: true,
                    clearHistory: true,
                    transition: {
                        name: "slideRight"
                    }
                });
            }
        }, 10000);
    }

    ngOnInit() {
        this.loadUsername();
    }

}