import { Component, OnInit } from '@angular/core';
import { Page } from 'tns-core-modules/ui/page/page';
import { DrawerClass } from '~/app/drawer';
import * as globals from "../globals";
import { Color } from "tns-core-modules/color"; 
import { BackendService } from './backend.service';
import { SettingsService } from '../settings-page/settings.service';

@Component({
  selector: 'ns-account-page',
  templateUrl: './account-page.component.html',
  styleUrls: ['./account-page.component.css'],
  moduleId: module.id,
  providers: [BackendService]
})
export class AccountPageComponent implements OnInit {
  
  private drawer: DrawerClass;

  constructor(private page: Page, private backendService: BackendService, private settingsService: SettingsService) {
    // Use the component constructor to inject providers.
    this.drawer = globals.getDrawer();
    page.actionBarHidden = true;
  }

  login(loginName, password){
    this.backendService.login(loginName, password)
    .subscribe((result) => {
      let tokenSetting = this.settingsService.getSetting(undefined, 61);
      tokenSetting.value = (<any>result).json.data.access_token;
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
