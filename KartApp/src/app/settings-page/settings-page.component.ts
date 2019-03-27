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
  private drawer: DrawerClass;

  private isDrawerSnap = true;
  private DrawerSnapSetting: Setting;

  private isImageSave = false;
  private imageSaveSetting: Setting;

  constructor(page: Page, private routerExtensions: RouterExtensions, private settingsService: SettingsService) {
    this.drawer = globals.getDrawer();
    page.actionBarHidden = true;
  }

  toggleDrawerSnap(){
    this.isDrawerSnap = !this.isDrawerSnap;
    this.DrawerSnapSetting.value = this.isDrawerSnap;
    this.settingsService.setSetting(this.DrawerSnapSetting);
  }

  drawerSnapChange(args) {
    let Switch = <Switch>args.object;
    this.isDrawerSnap = Switch.checked;
    this.DrawerSnapSetting.value = this.isDrawerSnap;
    this.settingsService.setSetting(this.DrawerSnapSetting);
  }

  toggleImageSave(){
    this.isImageSave = !this.isImageSave;
    this.imageSaveSetting.value = this.isImageSave;
    this.settingsService.setSetting(this.imageSaveSetting);
  }

  imageSaveChanged(args){
    let Switch = <Switch>args.object;
    this.isImageSave = Switch.checked;
    this.imageSaveSetting.value = this.isImageSave;
    this.settingsService.setSetting(this.imageSaveSetting);
  }


  ngOnInit() {
    let imageSetting = this.settingsService.getSetting(undefined, 4);
    if (imageSetting == undefined || imageSetting == null){
      imageSetting = {
        id: 4,
        name: "imageSave",
        type: "switch",
        value: this.isImageSave
      }
      this.settingsService.setSetting(imageSetting);
    }
    this.imageSaveSetting = imageSetting;
    let drawerSnapSetting = this.settingsService.getSetting(undefined, 3);
    if (drawerSnapSetting == undefined || drawerSnapSetting == null){
      drawerSnapSetting = {
        id: 3,
        name: "drawerSnap",
        type: "switch",
        value: this.isDrawerSnap
      }
      this.settingsService.setSetting(drawerSnapSetting);
    }
    this.DrawerSnapSetting = drawerSnapSetting;
  }

}
