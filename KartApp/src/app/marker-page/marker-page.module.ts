import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule } from 'nativescript-angular/common';
import { MarkerPageRoutingModule } from "./marker-page-routing.module";

import { MarkerPageComponent } from "./marker-page.component";

@NgModule({
  declarations: [
    MarkerPageComponent
  ],
  imports: [
    NativeScriptCommonModule,
    MarkerPageRoutingModule
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class MarkerPageModule { }
