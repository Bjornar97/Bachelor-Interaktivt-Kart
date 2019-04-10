import { Component, OnInit } from '@angular/core';
import { Page } from 'tns-core-modules/ui/page/page';
import { DrawerClass } from '~/app/drawer';
import * as globals from "../../globals";
import { Color } from "tns-core-modules/color"; 
import { BackendService } from '../backend.service';
import { SettingsService } from '../../settings-page/settings.service';
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { RouterExtensions } from 'nativescript-angular/router/router-extensions';

@Component({
  selector: 'ns-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css'],
  moduleId: module.id,
  providers: [BackendService]
}) 
export class LoginPageComponent implements OnInit {
  
  private drawer: DrawerClass;
  private message: string;

  constructor(private page: Page, private backendService: BackendService, private settingsService: SettingsService, private routerExtensions: RouterExtensions) {
    // Use the component constructor to inject providers.
    this.drawer = globals.getDrawer();
    page.actionBarHidden = true; 
  }
  

  login(loginName, password){
    console.log("email: " + loginName + " passord: " + password);
    this.backendService.login(loginName, password)
    .subscribe((result) => {
      let tokenSetting = this.settingsService.getSetting(undefined, 61);
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
      this.settingsService.setSetting(tokenSetting);
      this.routerExtensions.navigate(["account"], {
        animated: true,
        clearHistory: true,
        transition: {
          name: "slideLeft"
        }
      })
    });
  }




  ngOnInit() {

  }

}
