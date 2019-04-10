import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule } from 'nativescript-angular/common';
import { NativeScriptHttpClientModule } from "nativescript-angular/http-client";

import { LoginPageComponent } from "./login-page/login-page.component";
import { AccountPageRoutingModule } from "./account-page-routing.module";
import { RegisterPageComponent } from "./register-page/register-page.component";
import { FriendsPageComponent } from "./friends-page/friends-page.component";

import { NgShadowModule } from 'nativescript-ng-shadow';


@NgModule({
  declarations: [
    LoginPageComponent,
    RegisterPageComponent,
    FriendsPageComponent
  ],
  imports: [
    NativeScriptCommonModule,
    AccountPageRoutingModule,
    NativeScriptHttpClientModule,
    NgShadowModule
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class AccountPageModule { 

}
