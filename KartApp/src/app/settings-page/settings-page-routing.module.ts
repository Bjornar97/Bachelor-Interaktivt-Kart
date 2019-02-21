import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { SettingsPageComponent } from "./settings-page.component";
import { MapMenuComponent } from "./map-menu/map-menu.component";
import { elementEventFullName } from "@angular/core/src/view";

const routes: Routes = [
    { path: "", pathMatch: "full", component: SettingsPageComponent},
    { path: "menu/map", component: MapMenuComponent}
];

@NgModule({
    imports: [NativeScriptRouterModule.forChild(routes)],
    exports: [NativeScriptRouterModule]
})
export class SettingsPageRoutingModule { 

}
