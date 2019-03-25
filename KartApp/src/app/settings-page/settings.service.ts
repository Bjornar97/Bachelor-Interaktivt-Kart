import { Injectable, OnInit } from '@angular/core';
import * as fs from "tns-core-modules/file-system";
import { knownFolders, File, Folder } from "tns-core-modules/file-system";
import * as globals from '../globals';

export type Setting = {
  id: number,
  name: string,
  type: string,
  value: any,
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService implements OnInit{

  constructor() { 
    var settingsFile = this.getFile();
    this.settingsList = [];
    
    try {
      var text = settingsFile.readTextSync((error) => {
        console.log("Could not load settings from the file: " + error);
        settingsFile.removeSync();
        this.settingsListSuccess = false;
      });
      var settings = text; 
      this.settingsList = JSON.parse(settings);
    } catch (error) {
      console.log("Could not load settings from the file: " + error);
      settingsFile.removeSync();
      this.settingsListSuccess = false;
    }

    console.log("The loading of settings succeded");
    this.settingsListSuccess = true;
  }

  private settingsMap: Map<number, string>;
  private settingsList: Setting[];
  private settingsListSuccess: boolean;

  private lastSave: Date;
  private saving = false;

  private getFolder(){
    return knownFolders.documents().getFolder("Settings");
  }

  private getFile(){
    var folder = this.getFolder();
    return folder.getFile("settings.json");
  }

  getSettingsList(): Setting[]{
    var settings = this.settingsList;
    return settings;
  }
  
  setSetting(Setting: Setting){
    console.log("Got into setSetting in service");
    this.settingsList[Setting.id] = Setting;
    var time = new Date();
    if (this.lastSave != undefined){
      var duration = (time.valueOf() - this.lastSave.valueOf());
    } else {
      duration = 100000;
    }
    if (duration >= 5*1000){ // If the time since last save is above 10 seconds
      this.saveSettings();
      this.lastSave = time;
      console.log("Successfully saved settings");
    } else if (this.saving === false){
      this.saving = true;
      setTimeout(() => {
        console.log("Waited " + duration/1000 + " seconds. Saving settings");
        this.saveSettings();
      }, duration);
    }
  }

  saveSettings(){
    console.log("Saving settings");
    var file = this.getFile();
    file.writeText(JSON.stringify(this.getSettingsList()));
    this.saving = false; 
  }

  /**
   * getSetting - Get the setting you want.
   * 
   * @param SettingName The name of the setting you want to get. PLEASE DONT USE THIS(make it undefined), it is not working
   * @param SettingId The id of the setting. Use this.
   * 
   * SettingID list(if you make a new setting and save it somewhere, add it to this list):
   * 
   * 1: Auto Rotate Setting.
   * 
   * 2: Image Marker Setting. Should image markers appear on the map.
   * 
   * 11: Map menu setting.
   * 
   * 21: Drawer setting.
   * 
   * 31: Map position setting.
   * 
   * @returns The setting you asked for. If it does not exist, it doesnt return anything
   */
  getSetting(SettingName?: string, SettingId?: number): Setting {
    if (this.settingsListSuccess){
      if (SettingId != undefined){
        return this.settingsList[SettingId];
      } else if (SettingName != undefined){
        var setting = this.getSettingsList().find(x => x.name == SettingName);
        return setting;
      }
    } else {
      console.log("ERROR(settingsService): The settingsList did not succeed");
    }
  }

  ngOnInit(){
    
  }
  
}