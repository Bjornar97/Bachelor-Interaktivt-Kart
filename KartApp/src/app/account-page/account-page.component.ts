import { Component, OnInit } from '@angular/core';
import { Page } from 'tns-core-modules/ui/page/page';

@Component({
  selector: 'ns-account-page',
  templateUrl: './account-page.component.html',
  styleUrls: ['./account-page.component.css'],
  moduleId: module.id,
})
export class AccountPageComponent implements OnInit {

  constructor(page: Page) {
    // Use the component constructor to inject providers.
    page.actionBarHidden = true;
    
}

  ngOnInit() {
  }

}
