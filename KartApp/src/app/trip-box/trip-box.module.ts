import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule } from 'nativescript-angular/common';
import { TripBoxComponent } from "./trip-box.component";
import { NgShadowModule } from 'nativescript-ng-shadow';

@NgModule({
  declarations: [TripBoxComponent],
  imports: [
    NativeScriptCommonModule,
    NgShadowModule
  ],
  exports: [TripBoxComponent],
  schemas: [NO_ERRORS_SCHEMA]
})
export class TripBoxModule { }
