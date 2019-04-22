import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule } from 'nativescript-angular/common';
import { NativeScriptHttpClientModule } from "nativescript-angular/http-client";
import { AccountPageComponent} from "~/app/account-page/account-page.component";
import { LoginPageComponent } from "./login-page/login-page.component";
import { AccountPageRoutingModule } from "./account-page-routing.module";
import { RegisterPageComponent } from "./register-page/register-page.component";
import { FriendsPageComponent } from "./friends-page/friends-page.component";
import { TripBoxModule } from "../trip-box/trip-box.module";

import { NgShadowModule } from 'nativescript-ng-shadow';
import { FriendsSharedTripsPageComponent } from './friendsSharedTrips/friendsSharedTrips-page.component';
import { SavedTripsComponent } from './saved-trips/saved-trips.component';
import { AccountEditPageComponent } from '~/app/account-page/accountEdit/accountEdit-page.component';


@NgModule({
  declarations: [
    LoginPageComponent,
    RegisterPageComponent,
    AccountPageComponent,
    FriendsPageComponent,
    FriendsSharedTripsPageComponent,
    SavedTripsComponent,
    AccountEditPageComponent
  ],
  imports: [
    NativeScriptCommonModule,
    AccountPageRoutingModule,
    NativeScriptHttpClientModule,
    NgShadowModule,
    TripBoxModule
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class AccountPageModule { 

}
