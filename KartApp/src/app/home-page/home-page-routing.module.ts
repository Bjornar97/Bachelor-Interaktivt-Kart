import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { HomePageComponent } from "./home-page.component";
import { TripPageComponent } from "./trip-page/trip-page.component";
import { CurrentTripPageComponent } from "./current-trip-page/current-trip-page.component";

const routes: Routes = [
    { path: "", component: HomePageComponent, pathMatch: "full" },
    { path: "trip/:id", redirectTo: "trip/:id/true" },
    { path: "trip/:id/:local", component: TripPageComponent },
    { path: "currentTrip", component: CurrentTripPageComponent }
];

@NgModule({
    imports: [NativeScriptRouterModule.forChild(routes)],
    exports: [NativeScriptRouterModule]
})
export class HomeRoutingModule { }
