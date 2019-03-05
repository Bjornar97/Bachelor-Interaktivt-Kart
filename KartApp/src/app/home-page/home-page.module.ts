import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";

import { HomeRoutingModule } from "./home-page-routing.module";
import { HomePageComponent } from "./home-page.component";
import { TripBoxComponent } from './trip-box/trip-box.component';
import { TripPageComponent } from './trip-page/trip-page.component';
import { CurrentTripPageComponent } from './current-trip-page/current-trip-page.component';
import { NgShadowModule } from 'nativescript-ng-shadow';


@NgModule({
    imports: [
        NativeScriptCommonModule,
        HomeRoutingModule,
        NgShadowModule
    ],
    declarations: [
        HomePageComponent,
        TripBoxComponent,
        TripPageComponent,
        CurrentTripPageComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class HomeModule { }
