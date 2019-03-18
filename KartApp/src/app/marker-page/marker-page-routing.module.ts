import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { MarkerPageComponent } from "./marker-page.component";

const routes: Routes = [
    { path: "", redirectTo: "marker/null/-1", pathMatch: "full" },
    { path: ":type/:id", component: MarkerPageComponent },
];

@NgModule({
    imports: [NativeScriptRouterModule.forChild(routes)],
    exports: [NativeScriptRouterModule]
})
export class MarkerPageRoutingModule { }