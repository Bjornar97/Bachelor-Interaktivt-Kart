import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Page } from 'tns-core-modules/ui/page/page';
import { RouterExtensions } from "nativescript-angular/router";
import { SettingsService, Setting } from "./settings.service";
import { Switch } from "tns-core-modules/ui/switch";
import * as globals from '../globals';
import { DrawerClass } from '~/app/drawer';

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
  private drawer: DrawerClass;

  private isDrawerSnap = true;

  constructor(page: Page, private routerExtensions: RouterExtensions) {
    this.settingsService = globals.settingsService;
    this.drawer = globals.getDrawer();
    page.actionBarHidden = true;
  }

  drawerSnapChange(args){
    console.log("Changed");
  }


  ngOnInit() {

  }

}
