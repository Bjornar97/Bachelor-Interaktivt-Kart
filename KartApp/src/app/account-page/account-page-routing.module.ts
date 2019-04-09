import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { RegisterPageComponent } from "./register-page/register-page.component";
import { LoginPageComponent } from "./login-page/login-page.component";
import { FriendsPageComponent } from "./friends-page/friends-page.component";
import { MySharedTripsPageComponent } from "./mySharedTrips/mySharedTrips-page.component";
import { FriendsSharedTripsPageComponent } from "./friendsSharedTrips/friendsSharedTrips-page.component";
import { AccountEditPageComponent } from "./accountEdit/accountEdit-page.component";


const routes: Routes = [
    { path: "login", component: LoginPageComponent },
    { path: "register", component: RegisterPageComponent },
    { path: "account" },
    { path: "friends",component:FriendsPageComponent },
    { path: "mySharedTrips", component:MySharedTripsPageComponent },
    { path: "friendsSharedTrips", component:FriendsSharedTripsPageComponent },
    { path: "accountEdit", component: AccountEditPageComponent }
];

@NgModule({
    imports: [NativeScriptRouterModule.forChild(routes)],
    exports: [NativeScriptRouterModule]
})
export class AccountPageRoutingModule { }
