import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Page } from 'tns-core-modules/ui/page/page';
import { ListPicker } from "tns-core-modules/ui/list-picker";
import * as globals from '~/app/globals';
import { Setting, SettingsClass } from '../settings';
import { Switch } from 'tns-core-modules/ui/switch/switch';
import { RouterExtensions } from 'nativescript-angular/router';
import { DrawerClass } from '~/app/drawer';
import { isAndroid } from "tns-core-modules/platform";
import * as application from 'tns-core-modules/application';

let mapStylesStrings = ["Satellitt", "Friluftsliv", "Veikart"];

@Component({
  selector: 'ns-menu',
  templateUrl: './map-menu.component.html',
  styleUrls: ['../settings-page.component.css'],
  moduleId: module.id,
})
export class MapMenuComponent implements OnInit {
  private settingsClass: SettingsClass;
  private drawer: DrawerClass;

  private mapStyleSetting: Setting;
  private autoRotateSetting: Setting;
 
  private isAutoRotate = true;
  private mapStyle;

  constructor(page: Page, private routerExtensions: RouterExtensions) { 
    page.actionBarHidden = false;
    this.settingsClass = globals.getSettingsClass();
    this.mapStyle = this.settingsClass.getSetting(undefined, 11).value;

    this.autoRotateSetting = this.settingsClass.getSetting(undefined, 1);
    this.isAutoRotate = this.autoRotateSetting.value;

    this.drawer = globals.getDrawer();
  }

  private settingsService: SettingsService;

  private goBack() {
    this.routerExtensions.backToPreviousPage();
  }

  mapStyleChanged(style){
    globals.MainMap.setMapStyle(style);
    let setting = this.settingsClass.getSetting(undefined, 11);
    setting.value = style;
    this.mapStyle = style;
    this.settingsClass.setSetting(setting);
  }

  onAutoRotateChecked(args){
    let Switch = <Switch>args.object;
    this.isAutoRotate = Switch.checked;
    this.autoRotateSetting.value = Switch.checked;
    this.settingsClass.setSetting(this.autoRotateSetting);
    globals.MainMap.setAutoRotate(Switch.checked);
  }

  changeRotateSwitch(){
    var autorotate = this.isAutoRotate;
    if (autorotate){
      autorotate = false;
    } else { 
      autorotate = true;
    }
    this.autoRotateSetting.value = autorotate;
    this.isAutoRotate = autorotate;
    this.settingsClass.setSetting(this.autoRotateSetting);
    globals.MainMap.setAutoRotate(autorotate);
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
    
    if (isAndroid){
      application.android.on(application.AndroidApplication.activityBackPressedEvent, (args: any) => {
        args.cancel = true;
        this.goBack();
      });
    }
  }

}
