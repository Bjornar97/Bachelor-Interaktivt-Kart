import { Component, OnInit } from '@angular/core';
import { Page } from 'tns-core-modules/ui/page/page';
import { Color } from "tns-core-modules/color"; 

@Component({
  selector: 'ns-account-page',
  templateUrl: './account-page.component.html',
  styleUrls: ['./account-page.component.css'],
  moduleId: module.id,
})
export class AccountPageComponent implements OnInit {

  constructor(private page: Page) {
    // Use the component constructor to inject providers.
    page.actionBarHidden = true;

    

}

  ngOnInit() {
    var color=new Color("#0f0");
    var textField=this.page.getViewById("email-text");
    if (this.page.android){
      textField.android.setHintTextColor(color.android);
    }
    else if(this.page.ios){
      var placeholder=textField.ios.valueForKey("placeholderLabel")
      placeholder.textColor=color.ios;
    }
  }

}
