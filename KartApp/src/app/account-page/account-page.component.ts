import { Component, OnInit } from '@angular/core';
import { BackendService } from './backend.service';



@Component({
    selector: 'ns-account-page',
    templateUrl: './account-page.component.html',
    styleUrls: ['./account-page.component.css'],
    moduleId: module.id,
    providers: [BackendService]
  }) 
export class AccountPageComponent {

}