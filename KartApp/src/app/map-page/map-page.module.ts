import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";

import { MapPageComponent } from "./map-page.component";
import { MapPageRoutingModule } from "./map-page-routing.module";

import { registerElement } from "nativescript-angular/element-registry";
registerElement("Mapbox", () => require("nativescript-mapbox").MapboxView);

@NgModule({
    imports: [
        NativeScriptCommonModule,
        MapPageRoutingModule
    ],
    declarations: [
        MapPageComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class MapPageModule { }
