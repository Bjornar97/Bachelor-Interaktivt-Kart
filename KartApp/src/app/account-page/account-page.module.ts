import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule } from 'nativescript-angular/common';
import { NativeScriptHttpClientModule } from "nativescript-angular/http-client";
import { AccountPageComponent} from "~/app/account-page/account-page.component";
import { LoginPageComponent } from "./login-page/login-page.component";
import { AccountPageRoutingModule } from "./account-page-routing.module";
import { RegisterPageComponent } from "./register-page/register-page.component"

@NgModule({
  declarations: [
    LoginPageComponent,
    RegisterPageComponent,
    AccountPageComponent
  ],
  imports: [
    NativeScriptCommonModule,
    AccountPageRoutingModule,
    NativeScriptHttpClientModule
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class AccountPageModule { 

}
