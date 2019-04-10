import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule } from 'nativescript-angular/common';

import { SettingsPageComponent } from './settings-page.component';
import { SettingsPageRoutingModule } from "./settings-page-routing.module";
import { MapMenuComponent } from './map-menu/map-menu.component';
import { SettingsClass } from './settings';
import { NgShadowModule } from 'nativescript-ng-shadow';

@NgModule({
  declarations: [
    SettingsPageComponent,
    MapMenuComponent,
  ],
  imports: [
    NativeScriptCommonModule,
    SettingsPageRoutingModule,
    NgShadowModule
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class SettingsPageModule { 

}
