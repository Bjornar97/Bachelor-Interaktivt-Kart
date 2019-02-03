import { Component, OnInit } from "@angular/core";
import { Page } from "tns-core-modules/ui/page/page";

@Component({
    selector: "Home",
    moduleId: module.id,
    templateUrl: "./home.component.html"
})
export class HomeComponent implements OnInit {

    constructor(page: Page) {
        // Use the component constructor to inject providers.
        page.actionBarHidden = true;
    }

    ngOnInit(): void {
        // Init your component properties here.
    }
}
