import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Page } from 'tns-core-modules/ui/page/page';
import { ListPicker } from "tns-core-modules/ui/list-picker";
import * as globals from '~/app/globals';
import { SettingsService, Setting } from '../settings.service';

let mapStylesStrings = ["Satellitt", "Friluftsliv", "Veikart"]

@Component({
  selector: 'ns-menu',
  templateUrl: './map-menu.component.html',
  styleUrls: ['./map-menu.component.css'],
  moduleId: module.id,
})
export class MapMenuComponent implements OnInit {

  // TODO: Get settings from the settings service when that is finnished
  private settingsService: SettingsService;
  private mapStyleSetting: Setting;

  private mapStyleOptions;
  private showMapStyleOptions = false;

  private selectedIndex = 1;

  private mapStylesMap: Map<number, string>;

  private open = "closed";

  constructor(page: Page) { 
    page.actionBarHidden = true;
    this.settingsService = globals.settingsService;
    var setting = this.settingsService.getSetting(undefined, 11);
    if (setting != undefined){ 
      this.mapStyleSetting = setting;
      this.selectedIndex = setting.value;
    } else{
      this.mapStyleSetting = {
        id: 11,
        name: "mapStyle",
        type: "listPicker",
        value: 1
      }
    }

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

  toggleMapOptions(){
    if (this.showMapStyleOptions){
      this.showMapStyleOptions = false;
      this.open = "closed";
    } else {
      this.showMapStyleOptions = true;
      this.open = "open";
    }
  }

  mapStyleIndexChanged(args){
    let picker = <ListPicker>args.object;
    console.log("Changing mapStyle to " + this.mapStylesMap.get(picker.selectedIndex));
    globals.MainMap.setMapStyle(this.mapStylesMap.get(picker.selectedIndex));
    this.mapStyleSetting.value = picker.selectedIndex;
    this.settingsService.setSetting(this.mapStyleSetting);
    // TODO: Save it to the settingsService
  }

  ngOnInit() {
  }

}
