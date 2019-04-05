import { knownFolders } from "tns-core-modules/file-system";

export type Setting = {
  id: number,
  name: string,
  type: string,
  value: any,
}

export class SettingsClass {

  constructor() {
    var settingsFile = this.getFile();
    this.settingsList = [];
    
    try {
      var text = settingsFile.readTextSync((error) => {
        console.log("Could not load settings from the file: " + error);
        settingsFile.removeSync();
      });
      var settings = text; 
      this.settingsList = JSON.parse(settings);
      this.settingsListSuccess = true;
    } catch (error) {
      console.log("Could not load settings from the file: " + error);
      settingsFile.removeSync();
      this.settingsListSuccess = false;
    }

    console.log("The loading of settings succeded");

    console.log("Inittializing settings");
    
    // Auto Rotate Setting
    if (this.getSetting(undefined, 1) == undefined){
      console.log("Setting 1 was undefined: AutoRotate");
      this.setSetting({
        id: 1,
        name: "AutoRotate",
        type: "switch",
        value: true
      });
    }
    
    // Image marker setting Setting
    if (this.getSetting(undefined, 2) == undefined){
      console.log("Setting 2 was undefined: ImageMarker");
      this.setSetting({
        id: 2,
        name: "ImageMarker",
        type: "switch",
        value: true
      });
    }

    // Snap Setting
    if (this.getSetting(undefined, 3) == undefined){
      console.log("Setting 3 was undefined: Snap");
      this.setSetting({
        id: 3,
        name: "Snap",
        type: "switch",
        value: true
      });
    }
    
    // Image Save Setting
    if (this.getSetting(undefined, 4) == undefined){
      console.log("Setting 4 was undefined: ImageSave");
      this.setSetting({
        id: 4,
        name: "ImageSave",
        type: "switch",
        value: false
      });
    }

    // Map Menu Setting
    if (this.getSetting(undefined, 11) == undefined){
      console.log("Setting 11 was undefined: mapStyle");
      this.setSetting({
        id: 11,
        name: "mapStyle",
        type: "buttonRow",
        value: "outdoors"
      });
    }

    // Drawer Setting
    if (this.getSetting(undefined, 21) == undefined){
      console.log("Setting 21 was undefined: Drawer");
      this.setSetting({
        id: 21,
        name: "Drawer",
        type: "Object",
        value: undefined
      });
    }

    // Map Position Setting
    if (this.getSetting(undefined, 31) == undefined){
      console.log("Setting 31 was undefined: MapPosition");
      this.setSetting({
        id: 31,
        name: "MapPosition",
        type: "Object",
        value: undefined
      });
    }

    // Trip Marker Ids Setting
    if (this.getSetting(undefined, 32) == undefined){
      console.log("Setting 32 was undefined: TripMarkerIds");
      this.setSetting({
        id: 32,
        name: "TripMarkerIds",
        type: "markers",
        value: []
      });
    }

    // tripActive Setting
    if (this.getSetting(undefined, 41) == undefined){
      console.log("Setting 41 was undefined: tripActive");
      this.setSetting({
        id: 41,
        name: "tripActive",
        type: "Object",
        value: false
      });
    }

    // Home Page Height Setting
    if (this.getSetting(undefined, 51) == undefined){
      console.log("Setting 51 was undefined: HomePageHeight");
      this.setSetting({
        id: 51,
        name: "homePageHeight",
        type: "height",
        value: undefined
      });
    }

    // Current Trip Page Height Setting
    if (this.getSetting(undefined, 52) == undefined){
      console.log("Setting 52 was undefined: currentTripHeight");
      this.setSetting({
        id: 52,
        name: "currentTripHeight",
        type: "height",
        value: undefined
      });
    }
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
      this.lastSave = time;
      this.saveSettings();
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
   * 1: Auto Rotate Setting - Should the map rotate with you
   * 
   * 2: Image Marker Setting - Should image markers appear on the map.
   * 
   * 3: SnapSetting - Should the drawer snap into place
   *
   * 4: ImageSave - Should images taken in the app be saved to the gallery
   * 
   * 11: Map menu setting.
   * 
   * 21: Drawer setting.
   * 
   * 31: Map position setting.
   * 
   * 32: Trip Marker Ids - Ids for the markers from trips that is drawn on the map.
   * 
   * 41: tripActive
   * 
   * 51: HomePageHeight - The height of the drawer in home-page
   * 
   * 52: currentTripPageHeight - The height of the drawer in currentTripPage
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
      return null;
    }
  }
  
}