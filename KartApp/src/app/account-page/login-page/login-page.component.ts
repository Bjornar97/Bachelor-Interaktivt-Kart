import { Component, OnInit } from '@angular/core';
import { Page } from 'tns-core-modules/ui/page/page';
import { DrawerClass } from '~/app/drawer';
import * as globals from "../../globals";
import { Color } from "tns-core-modules/color"; 
import { BackendService } from '../backend.service';
import { SettingsClass } from '../../settings-page/settings';
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { RouterExtensions } from 'nativescript-angular/router/router-extensions';
import * as utils from "tns-core-modules/utils/utils";
import { isIOS, isAndroid } from "tns-core-modules/platform";
import * as frame from "tns-core-modules/ui/frame";
import { TextField } from 'tns-core-modules/ui/text-field/text-field';

@Component({
  selector: 'ns-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css'],
  moduleId: module.id,
  providers: [BackendService]
}) 
export class LoginPageComponent implements OnInit {
  
  private drawer: DrawerClass;
  private settingsClass: SettingsClass;
  private message: string;
  private loading: boolean;

  constructor(private page: Page, private backendService: BackendService, private routerExtensions: RouterExtensions) {
    // Use the component constructor to inject providers.
    this.drawer = globals.getDrawer();
    page.actionBarHidden = true; 
    this.settingsClass = globals.getSettingsClass();
  }
  
  dismissSoftKeybaord(){
    if (isIOS) {
       frame.topmost().nativeView.endEditing(true);
    }
    if (isAndroid) {
      utils.ad.dismissSoftInput();
    }
  }

  changeTextField(textfield: TextField) {
    textfield.focus();
  }
  

  login(loginName, password){
    if (loginName == ""){
      this.message = "Du må skrive inn epost og passord";
      return;
    }
    try {
      console.log("email: " + loginName);
      this.loading = true;
      this.dismissSoftKeybaord();
      let request = this.backendService.login(loginName, password)
        .subscribe((result) => {
        console.dir(result);
        if (<any>result.status == 202){
          let tokenSetting = this.settingsClass.getSetting(61);
          console.dir(result);
          tokenSetting.value = (<any>result).body.access_token;
          this.message = (<any>result).body.message;
          this.settingsClass.setSetting(tokenSetting);
          this.routerExtensions.navigate(["account"], {
            animated: true,
            clearHistory: true,
            transition: {
              name: "slideLeft"
            }
          });
        } else if (<any>result.status == 200) {
          this.message = "Feil epost eller passord";
        } else {
          this.message = "Noe gikk galt. Prøv igjen";
        }
        this.loading = false;
    });
    setTimeout(() => {
      if (this.loading) {
        console.log("ERROR: Timeout");
        this.loading = false;
        this.message = "Noe gikk galt. Prøv igjen";
        request.unsubscribe();
      }
    }, 10000);
    
    } catch (error) {
      console.log("ERROR in login page login. " + error);
      this.message = "Det skjedde noe galt. Prøv igjen";
    }
    
  }

  ngOnInit() {
    console.log("Initting login");
    try {
      let token = this.settingsClass.getSetting(61).value;
      if (token != undefined) {
        this.routerExtensions.navigate(["account"], {
          animated: true,
          clearHistory: true,
          transition: {
            name: "slideLeft"
          }
        });
      }
    } catch (error) {
      console.log("ERROR in login init. " + error);
    }
  }

}
