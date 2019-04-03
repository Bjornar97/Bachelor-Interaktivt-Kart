import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Page } from 'tns-core-modules/ui/page/page';
import { ListPicker } from "tns-core-modules/ui/list-picker";
import * as globals from '~/app/globals';
import { SettingsService, Setting } from '../settings.service';
import { Switch } from 'tns-core-modules/ui/switch/switch';
import { RouterExtensions } from 'nativescript-angular/router';
import { DrawerClass } from '~/app/drawer';

let mapStylesStrings = ["Satellitt", "Friluftsliv", "Veikart"]

@Component({
  selector: 'ns-menu',
  templateUrl: './map-menu.component.html',
  styleUrls: ['../settings-page.component.css'],
  moduleId: module.id,
})
export class MapMenuComponent implements OnInit {
  private drawer: DrawerClass;

  private mapStyleSetting: Setting;
  private autoRotateSetting: Setting;
 
  private isAutoRotate = true;
  private mapStyle = 'outdoors';

  constructor(page: Page, private routerExtensions: RouterExtensions, private settingsService: SettingsService) { 
    page.actionBarHidden = false;
    this.drawer = globals.getDrawer();
  }

  private goBack() {
    this.routerExtensions.backToPreviousPage();
  }

  mapStyleChanged(style){
    globals.MainMap.setMapStyle(style);
    this.mapStyleSetting.value = style;
    this.mapStyle = style;
    this.settingsService.setSetting(this.mapStyleSetting);
  }

  onAutoRotateChecked(args){
    let Switch = <Switch>args.object;
    this.isAutoRotate = Switch.checked;
    this.autoRotateSetting.value = Switch.checked;
    this.settingsService.setSetting(this.autoRotateSetting);
  }

  changeRotateSwitch(){
    this.isAutoRotate = !this.isAutoRotate;
    this.autoRotateSetting.value = this.isAutoRotate;
    this.settingsService.setSetting(this.autoRotateSetting);
  }

  ngOnInit() {
    let autoRotateSetting = this.settingsService.getSetting(undefined, 1);
    if (autoRotateSetting == undefined || autoRotateSetting == null){
      autoRotateSetting = {
        id: 1,
        name: "autoRotate",
        type: "switch",
        value: this.isAutoRotate
      }
      this.settingsService.setSetting(autoRotateSetting);
    }
    this.autoRotateSetting = autoRotateSetting;

    let mapStyleSetting = this.settingsService.getSetting(undefined, 11);
    if (mapStyleSetting == undefined || mapStyleSetting == null){
      mapStyleSetting = {
        id: 11,
        name: "mapStyle",
        type: "buttonRow",
        value: this.mapStyle
      }
      this.settingsService.setSetting(mapStyleSetting);
    }
    this.mapStyleSetting = mapStyleSetting;
  }

}
