import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Page } from 'tns-core-modules/ui/page/page';
import { RouterExtensions } from "nativescript-angular/router";
import { SettingsClass, Setting } from "./settings";
import { Switch } from "tns-core-modules/ui/switch";
import * as globals from '../globals';
import { DrawerClass } from '~/app/drawer';
import { Color } from "tns-core-modules/color";

@Component({
  selector: 'ns-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  moduleId: module.id,
})
export class SettingsPageComponent implements OnInit {

  private settingsClass: SettingsClass;
  private drawer: DrawerClass;

  private isDrawerSnap;
  private isImageSave;

  constructor(page: Page, private routerExtensions: RouterExtensions) {
    page.actionBarHidden = true;
    this.settingsClass = globals.getSettingsClass();
    this.drawer = globals.getDrawer();
    
    let drawerSnapSetting = this.settingsClass.getSetting(3, true);
    this.isDrawerSnap = drawerSnapSetting.value;

    let isImageSaveSetting = this.settingsClass.getSetting(4, false);
    this.isImageSave = isImageSaveSetting.value;
  }

  setDrawerSnapSetting(value: boolean){
    let setting = this.settingsClass.getSetting(3);
    setting.value = value;
    this.settingsClass.setSetting(setting);
  }

  drawerSnapChange(args) {
    let Switch = <Switch>args.object;
    this.setDrawerSnapSetting(Switch.checked);
  }

  toggleSwitch(switchView: Switch){
    switchView.checked = !switchView.checked;
  }

  imageSaveChanged(args){
    let Switch = <Switch>args.object;
    let setting = this.settingsClass.getSetting(4);
    setting.value = Switch.checked;
    this.settingsClass.setSetting(setting);
  }


  ngOnInit() {
  }

}
