import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";

const routes: Routes = [
    { path: "", redirectTo: "/home", pathMatch: "full" },
    { path: "home", loadChildren: "~/app/home-page/home-page.module#HomeModule" },
    { path: "account", loadChildren: "~/app/account-page/account-page.module#AccountPageModule" },
    { path: "settings", loadChildren: "~/app/settings-page/settings-page.module#SettingsPageModule" }
];

@NgModule({
    imports: [NativeScriptRouterModule.forRoot(routes)],
    exports: [NativeScriptRouterModule]
})
export class AppRoutingModule { }
