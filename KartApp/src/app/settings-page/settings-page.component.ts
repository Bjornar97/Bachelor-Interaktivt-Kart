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

  private autoRotateSetting: Setting;

  private settingsService: SettingsService;

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

  private isAutoRotate = true;


  constructor(page: Page, private routerExtensions: RouterExtensions) {
    page.actionBarHidden = true;
    this.settingsService = globals.settingsService;
    this.autoRotateSetting = this.settingsService.getSetting(undefined, 1);

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

    // var path = this.routerExtensions.router.url;
    // console.log("path: " + path);
    // var paths = path.split("/");
    // console.dir(paths);
    // this.menuId = parseInt(paths[paths.length - 1]);

    // console.log("Menu ID: " + this.menuId);
    // var settingsTree = this.settingsService.getSettingsStructure(this.menuId);
    // console.log("Found settingsTree: ");
    // console.dir(settingsTree);
    // this.Settings = settingsTree.subItems;
    // console.log("Added settingsTree to this.Settings");
  }

  // public tapSetting(tapitem: SettingsItem, groupItem: subItems){
  //   console.log("Tapped label: ");
  //   console.dir(tapitem);
  //   if (tapitem.type == "menu"){
  //     this.routerExtensions.navigate(["/settings/menu/", this.menuId, tapitem.id], { transition: {name: "slide"}});
  
  //     var path = this.routerExtensions.router.url;
  //     console.log("path: " + path);
  //     var paths = path.split("/");
  //     console.dir(paths);
  //     this.menuId = parseInt(paths[paths.length - 1]);
  
  //     console.log("Menu ID: " + this.menuId);
  //     var settingsTree = this.settingsService.getSettingsStructure(this.menuId);
  //     console.log("Found settingsTree: ");
  //     console.dir(settingsTree);
  //     this.Settings = settingsTree.subItems;
  //     console.log("Added settingsTree to this.Settings");
  //   } else if (tapitem.type = "check-setting"){
  //     var setting = tapitem.setting;
  //     if(tapitem.setting){
  //       tapitem.setting.value = false;
  //     } else if (!tapitem.setting) {
  //       tapitem.setting.value = true;
  //     }

  //     if (!groupItem.multiple){
  //       groupItem.settings.forEach((setting) => {
  //         if (setting.setting.id != tapitem.setting.id){
  //           setting.setting.value = false;
  //         } else {
  //           setting.setting.value = true;
  //         }
  //         console.log("Setting setting: ");
  //         console.dir(setting.setting);
  //         this.settingsService.setSetting(setting.setting);
  //       });
  //     }
  //   }
  // }
      

  // public tapMenu(event, id){
  //   console.log(event);
  //   this.routerExtensions.navigate(["settings", "menu", id]);
  // }


  ngOnInit() {

  }

}
