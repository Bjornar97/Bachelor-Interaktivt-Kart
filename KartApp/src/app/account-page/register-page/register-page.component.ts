import { Component, OnInit } from '@angular/core';
import { BackendService } from '../backend.service';
import { SettingsService } from '../../settings-page/settings.service';
import { Page } from 'tns-core-modules/ui/page/page';
import { DrawerClass } from '~/app/drawer';
import * as globals from "../../globals";

@Component({
    moduleId: module.id,
    selector: "ns-register-page",
    templateUrl: "register-page.component.html",
    styleUrls: ['./register-page.component.css'],
    providers: [BackendService]
})
export class RegisterPageComponent {

   


}