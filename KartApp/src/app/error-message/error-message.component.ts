import { Component, OnInit } from '@angular/core';
import * as globals from "../globals";
import { View, isAndroid, isIOS } from 'tns-core-modules/ui/page/page';
import * as dialogs from "tns-core-modules/ui/dialogs";

@Component({
  selector: 'ns-error-message',
  templateUrl: './error-message.component.html',
  styleUrls: ['./error-message.component.css'],
  moduleId: module.id,
})
export class ErrorMessageComponent implements OnInit {

  constructor() {
  }

  private android: boolean = isAndroid;
  private ios: boolean = isIOS;

  private errorList: string[];
  
  errorCreatedAnimation(box: View){
    box.scaleX = 0;
    box.scaleY = 0;
    box.animate({
      scale: {x: 1, y: 1},
      duration: 200,
      delay: 0
    });
  }

  ngOnInit() {
    this.errorList = globals.getErrorList();
  }

}
