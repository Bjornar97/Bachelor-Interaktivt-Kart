import { NgModule, NO_ERRORS_SCHEMA, OnInit } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

import { registerElement } from "nativescript-angular/element-registry";
import { MapComponent } from "./map/map.component";
registerElement("Mapbox", () => require("nativescript-mapbox").MapboxView);
registerElement('Fab', () => require('nativescript-floatingactionbutton').Fab);

import { NgShadowModule } from 'nativescript-ng-shadow';
import { ErrorMessageComponent } from './error-message/error-message.component';

@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        NativeScriptModule,
        AppRoutingModule,
        NgShadowModule
    ],
    declarations: [
        AppComponent,
        MapComponent,
        ErrorMessageComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ],
})
export class AppModule implements OnInit{ 
    
    // Dette skjer når appen starter
    ngOnInit(){
        console.log("Innitting app module!");
    }
}
