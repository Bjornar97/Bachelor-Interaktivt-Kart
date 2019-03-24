import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Page } from 'tns-core-modules/ui/page/page';
import { RouterExtensions } from "nativescript-angular/router";
import { SettingsService, Setting } from "./settings.service";
import { Switch } from "tns-core-modules/ui/switch";
import * as globals from '../globals';

@Component({
  selector: 'ns-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SettingsService],
  moduleId: module.id,
})
export class SettingsPageComponent implements OnInit {

  private settingsService: SettingsService;

  private isDrawerSnap = true;

  constructor(page: Page, private routerExtensions: RouterExtensions) {
    page.actionBarHidden = false;
    this.settingsService = globals.settingsService;
  }

  drawerSnapChange(args){
    console.log("Changed");
  }


  ngOnInit() {

  }

}
