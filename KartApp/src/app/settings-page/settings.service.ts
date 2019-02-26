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

  private getFolder(){
    return knownFolders.documents().getFolder("Settings");
  }

  private getFile(){
    var folder = this.getFolder();
    return folder.getFile("settings.json");
  }

  private settingsMap: Map<number, string>;

  private settingsList: Setting[];
  private settingsListSuccess: boolean;

  private lastSave: Date;

  constructor() { 
    var settingsFile = this.getFile();
    this.settingsList = [];
    settingsFile.readText().then(text => {
      var settings = text; 
      this.settingsList = JSON.parse(settings);
      this.settingsListSuccess = true;
    }).catch(error => {
      console.log("Could not load settings from the file: " + error);
      this.settingsListSuccess = false; 
    }); 
  }

  getSettingsList(): Setting[]{
    var settings = this.settingsList;
    return settings;
  }

  private saving = false;

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