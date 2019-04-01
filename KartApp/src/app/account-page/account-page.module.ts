import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { NativeScriptCommonModule } from 'nativescript-angular/common';
import { AccountPageComponent } from "./account-page.component";
import { AccountPageRoutingModule } from "./account-page-routing.module";

@NgModule({
  declarations: [
    AccountPageComponent
  ],
  imports: [
    NativeScriptCommonModule,
    AccountPageRoutingModule
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class AccountPageModule { 

}
