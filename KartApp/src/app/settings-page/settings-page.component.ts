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
    this.isDrawerSnap = this.settingsClass.getSetting(undefined, 3).value;
    this.isImageSave = this.settingsClass.getSetting(undefined, 4).value;
  }

  setDrawerSnapSetting(value: boolean){
    let setting = this.settingsClass.getSetting(undefined, 3);
    setting.value = value;
    this.settingsClass.setSetting(setting);
  }

  drawerSnapChange(args) {
    let Switch = <Switch>args.object;
    this.isDrawerSnap = Switch.checked;
    this.setDrawerSnapSetting(this.isDrawerSnap);
  }

  toggleSwitch(switchView: Switch){
    switchView.checked = !switchView.checked;
  }

  imageSaveChanged(args){
    let Switch = <Switch>args.object;
    this.isImageSave = Switch.checked;
    let setting = this.settingsClass.getSetting(undefined, 4);
    setting.value = this.isImageSave;
    this.settingsClass.setSetting(setting);
  }


  ngOnInit() {
  }

}
