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
 
  private isAutoRotate = true;
  private mapStyle;

  constructor(page: Page, private routerExtensions: RouterExtensions) { 
    page.actionBarHidden = true;
    console.log("Creating map-menu");
    this.settingsClass = globals.getSettingsClass();
    this.drawer = globals.getDrawer();

    let mapStyleSetting = this.settingsClass.getSetting(11, "outdoors");
    this.mapStyle = mapStyleSetting.value;

    let autoRotateSetting = this.settingsClass.getSetting(1, true);
    this.isAutoRotate = autoRotateSetting.value;

    console.log("Created settings from settingsClass: ");
    console.dir(autoRotateSetting);
  }

  private goBack() {
    this.routerExtensions.navigate(["settings"], {
      animated: true,
      clearHistory: true,
      transition: {
        name: "slideRight"
      }
    });
  }

  mapStyleChanged(style){
    globals.MainMap.setMapStyle(style);
    let setting = this.settingsClass.getSetting(11, "outdoors");
    setting.value = style;
    this.mapStyle = style;
    this.settingsClass.setSetting(setting);
  }

  toggleAutoRotate() {
    this.isAutoRotate = !this.isAutoRotate;
  }

  onAutoRotateChecked(args){
    let Switch = <Switch>args.object;
    this.isAutoRotate = Switch.checked;
    let autoRotateSetting = this.settingsClass.getSetting(1, true);
    autoRotateSetting.value = Switch.checked;
    this.settingsClass.setSetting(autoRotateSetting);
  }

  ngOnInit() {    
    if (isAndroid){
      application.android.on(application.AndroidApplication.activityBackPressedEvent, (args: any) => {
        args.cancel = true;
        this.goBack();
      });
    }
    console.log("Initted map menu");
  }

}
