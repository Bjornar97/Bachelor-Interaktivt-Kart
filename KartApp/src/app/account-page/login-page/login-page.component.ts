import { Component, OnInit } from '@angular/core';
import { Page } from 'tns-core-modules/ui/page/page';
import { DrawerClass } from '~/app/drawer';
import * as globals from "../../globals";
import { Color } from "tns-core-modules/color"; 
import { BackendService } from '../backend.service';
import { SettingsService } from '../../settings-page/settings.service';

@Component({
  selector: 'ns-account-page',
  templateUrl: './account-page.component.html',
  styleUrls: ['./account-page.component.css'],
  moduleId: module.id,
  providers: [BackendService]
}) 
export class LoginPageComponent implements OnInit {
  
  private drawer: DrawerClass;
  private username: string;

  constructor(private page: Page, private backendService: BackendService, private settingsService: SettingsService) {
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
      this.username = (<any>result).body.message;
      this.settingsService.setSetting(tokenSetting);
    });
  }


  ngOnInit() {
    var color=new Color("#0f0");
    var textField=this.page.getViewById("email-text");
    if (this.page.android){
      textField.android.setHintTextColor(color.android);
    }
    else if(this.page.ios){
      //var placeholder=textField.ios.valueForKey("placeholderLabel")
      //placeholder.textColor=color.ios;
    }

  }

}
