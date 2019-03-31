import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Page } from 'tns-core-modules/ui/page/page';
import { RouterExtensions } from "nativescript-angular/router";
import { SettingsService, Setting } from "./settings.service";
import { Switch } from "tns-core-modules/ui/switch";
import * as globals from '../globals';
import { DrawerClass } from '~/app/drawer';
import { Color } from "tns-core-modules/color";

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
  private isImageSave = false;

  constructor(page: Page, private routerExtensions: RouterExtensions) {
    page.actionBarHidden = false;
    this.settingsService = globals.settingsService;
    this.drawer = globals.getDrawer();
  }

  toggleDrawerSnap(){
    this.isDrawerSnap = !this.isDrawerSnap;
  }

  setDrawerSnapSetting(value: boolean){
    let setting = this.settingsService.getSetting(undefined, 3);
    if (setting == undefined){
      setting = {
        id: 3,
        name: "drawerSnap",
        type: "switch",
        value: value
      }
    } else {
      setting.value = value;
    }

    this.settingsService.setSetting(setting);
  }

  drawerSnapChange(args) {
    let Switch = <Switch>args.object;
    this.isDrawerSnap = Switch.checked;
    this.setDrawerSnapSetting(this.isDrawerSnap);
  }

  toggleImageSave(){
    this.isImageSave = !this.isImageSave;
  }

  imageSaveChanged(args){
    let Switch = <Switch>args.object;
    this.isImageSave = Switch.checked;
    let setting = this.settingsService.getSetting(undefined, 4);
    if (setting == undefined){
      setting = {
        id: 4,
        name: "imageSave",
        type: "switch",
        value: this.isImageSave
      }
    } else {
      setting.value = this.isImageSave;
    }
    this.settingsService.setSetting(setting);
  }


  ngOnInit() {
  }

}
