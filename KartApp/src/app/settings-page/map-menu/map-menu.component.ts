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
  private settingsService: SettingsService;
  private drawer: DrawerClass;
  private mapStyleSetting: Setting;
  private autoRotateSetting: Setting;
 
  private isAutoRotate = true;

  private mapStyleOptions;
  private showMapStyleOptions = false;

  private selectedIndex = 1;

  private mapStylesMap: Map<number, string>;

  private open = "closed";

  constructor(page: Page, private routerExtensions: RouterExtensions) { 
    page.actionBarHidden = false;
    this.settingsService = globals.settingsService;
    var setting = this.settingsService.getSetting(undefined, 11);
    if (setting != undefined){ 
      this.mapStyleSetting = setting;
      this.mapStyle = setting.value;
      this.selectedIndex = setting.value;
    } else{
      this.mapStyleSetting = {
        id: 11,
        name: "mapStyle",
        type: "buttonRow",
        value: 'outdoors'
      }
    }
    this.autoRotateSetting = this.settingsService.getSetting(undefined, 1);

    this.drawer = globals.getDrawer();

    if (this.autoRotateSetting == undefined || null){ 
      this.autoRotateSetting = {
        id: 1,
        name: "autoRotate",
        type: "switch",
        value: this.isAutoRotate
      }
      this.settingsService.setSetting(this.autoRotateSetting);
    } else {
      this.isAutoRotate = this.autoRotateSetting.value;
    }
    globals.MainMap.setAutoRotate(this.isAutoRotate);

    var mapStyles = [];
    var i = 0;
    this.mapStylesMap = new Map();

    var englishNames = ["satellite", "outdoors", "street"];

    mapStylesStrings.forEach(option => {
      mapStyles.push(option);
      this.mapStylesMap.set(i, englishNames[i]);
      i++;
    });

    this.mapStyleOptions = mapStyles;

  }

  private onNavBtnTap() {
    this.routerExtensions.backToPreviousPage();
  }

  private mapStyle = 'outdoors';

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
    this.settingsService.setSetting(this.autoRotateSetting);
    globals.MainMap.setAutoRotate(autorotate);
  }

  ngOnInit() {
  }

}
