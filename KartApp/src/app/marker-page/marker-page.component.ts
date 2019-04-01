import { Component, OnInit } from '@angular/core';
import * as globals from "../globals";
import { DrawerClass } from "~/app/drawer";
import { RouterExtensions } from 'nativescript-angular/router';

@Component({
  selector: 'ns-marker-page',
  templateUrl: './marker-page.component.html',
  styleUrls: ['./marker-page.component.css'],
  moduleId: module.id,
})
export class MarkerPageComponent implements OnInit {
  
  private drawer: DrawerClass;

  constructor(private routerExtensions: RouterExtensions) {
    this.drawer = globals.getDrawer();
  }
  
  private goBack() {
    this.routerExtensions.backToPreviousPage();
  }

  ngOnInit() {
  }

}
