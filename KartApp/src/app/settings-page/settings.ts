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
    } catch (error) {
      console.log("Could not load settings from the file: " + error);
      settingsFile.removeSync();
    }

    console.log("Inittializing settings");
    
    // Auto Rotate Setting
    let autoRotateSetting = this.getSetting(1, true);
    this.generateSetting(1, "AutoRotate", "switch", autoRotateSetting.value);
    
    // Image marker setting Setting
    let imageMarkerSetting = this.getSetting(2, true);
    this.generateSetting(2, "ImageMarker", "switch", imageMarkerSetting.value);

    // Snap Setting
    let snapSetting = this.getSetting(3, true);
    this.generateSetting(3, "Snap", "switch", snapSetting.value);
    
    // Image Save Setting
    let imageSaveSetting = this.getSetting(4, false);
    this.generateSetting(4, "ImageSave", "switch", imageSaveSetting.value);

    // Map Menu Setting
    let mapStyleSetting = this.getSetting(11, "outdoors");
    this.generateSetting(11, "mapStyle", "buttonRow", mapStyleSetting.value);

    // Drawer Setting
    let drawerSettting = this.getSetting(21);
    this.generateSetting(1, "Drawer", "Object", drawerSettting.value);

    // Map Position Setting
    let mapPositionSetting = this.getSetting(31);
    this.generateSetting(31, "MapPosition", "Object", mapPositionSetting.value);

    // Trip Marker Ids Setting
    let tripMarkerIdsSetting = this.getSetting(32, []);
    this.generateSetting(32, "TripMarkerIds", "markers", tripMarkerIdsSetting.value);

    // tripActive Setting
    let tripActiveSetting = this.getSetting(41, false);
    this.generateSetting(41, "tripActive", "Object", tripActiveSetting.value);

    // Drawer Height Setting
    let drawerHeightSetting = this.getSetting(48);
    this.generateSetting(48, "drawerHeight", "height", drawerHeightSetting.value);

    // Home Page Height Setting
    let homePageHeightSetting = this.getSetting(51);
    this.generateSetting(51, "homePageHeight", "height", homePageHeightSetting.value);

    // Current Trip Page Height Setting
    let currentTripHeightSetting = this.getSetting(52);
    this.generateSetting(52, "currentTripHeight", "height", currentTripHeightSetting.value);

    // Logged in token Setting
    let loggedInTokenSetting = this.getSetting(61);
    this.generateSetting(61, "MapPosition", "Object", loggedInTokenSetting.value);

    console.log("Settings successfully innitialized");
  }

  private settingsList: Setting[];

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
   * 5: All ImageMarkers Setting - Should all imagemarkers be shown on the map. If false, it only shows the markers on the trips that is drawn on the map.
   * 
   * 4: ImageSave - Should images get saved to the gallery
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
   * 48: drawerSettting - The height of the drawer
   * 
   * 51: HomePageHeight - The height of the drawer in home-page
   * 
   * 52: currentTripPageHeight - The height of the drawer in currentTripPage
   * 
   * 61: Login Token - The logged in token
   * 
   * @returns The setting you asked for. If it does not exist, it doesnt return anything
   */
  getSetting(SettingId: number, defaultvalue: any = undefined): Setting {
      if (SettingId != undefined){
        let setting = this.settingsList[SettingId];
        if (setting == undefined) {
          setting = {
            id: SettingId,
            name: undefined,
            type: undefined,
            value: defaultvalue
          }
        }
        return setting;
      }
  }

  generateSetting(id: number, name: string, type: string, value: any) {
    let setting = {
      id: id,
      name: name,
      type: type,
      value: value
    }
    this.setSetting(setting);

    return setting;
  }
  
}