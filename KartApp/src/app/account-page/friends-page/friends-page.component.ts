import { Component, OnInit } from '@angular/core';
import { BackendService } from '../backend.service';
import * as Toast from 'nativescript-toast';
import { Page, View } from 'tns-core-modules/ui/page/page';
import { confirm } from "tns-core-modules/ui/dialogs";
import { RouterExtensions } from 'nativescript-angular/router';
import { StackLayout } from 'tns-core-modules/ui/layouts/stack-layout';
import { GridLayout } from 'tns-core-modules/ui/layouts/grid-layout';
import { Label } from "tns-core-modules/ui/label";
import { TextField } from "tns-core-modules/ui/text-field";
import { Button } from "tns-core-modules/ui/button";
import { DrawerClass } from '~/app/drawer';
import * as globals from "~/app/globals";


@Component({
    selector: 'ns-friends-page',
    templateUrl: './friends-page.component.html',
    styleUrls: ['./friends-page.component.css'],
    moduleId: module.id,
    providers: [BackendService]
  }) 
export class FriendsPageComponent implements OnInit{
    constructor(private page: Page, private backendService: BackendService, private routerExtentions: RouterExtensions) {
        this.page.actionBarHidden = true;
        this.drawer = globals.getDrawer();
    }

    private drawer: DrawerClass;

    private friendList: Array<any>;
    private friendRequests: Array<any>;

    private newFriendExpanded = false;
    private newFriendUsername;
    private newFriendUsernameText: string;

    private sendingRequest = false;

    private loading = true;
    private success = true;

    goBack() {
        this.routerExtentions.backToPreviousPage();
    }

    expandNewFriend(arrow: Label, box: GridLayout){
        console.log("Expanding");
        if (!this.newFriendExpanded){
            arrow.animate({
                rotate: 180,
                duration: 250
            }).then(() => {
                let height = 60;
                let interval = setInterval(() => {
                    if (height >= 120){
                        box.set("height", "100dp");
                        this.newFriendExpanded = true;
                        clearInterval(interval);
                    }
                    height += 5;
                    box.set("height", height + "dp");
                }, 5);
                
            });
        } else {
            arrow.animate({
                rotate: 0,
                duration: 250
            }).then(() => {
                let height = 120;
                let interval = setInterval(() => {
                    if (height <= 60){
                        box.set("height", "60dp");
                        this.newFriendExpanded = false;
                        clearInterval(interval);
                    }
                    height -= 5;
                    box.set("height", height + "dp");
                }, 5);
            });
        }
    }

    animateNewFriend(textfield: TextField, btn: Button) {
    }

    private usernameExists = undefined;
    private checkingUsername = false;
    private lastCheck: Date;

    checkUsername(args) {
        let textfield = <TextField>args.object;
        console.log("Got into checking username " + textfield.text);
        if (this.checkingUsername) {
            return;
        } else {
            if (this.lastCheck != undefined) {
                if (new Date().getTime() - this.lastCheck.getTime() > 1000) {
                    this.lastCheck = new Date();
                    try {
                        this.backendService.userNameExist(textfield.text)
                        .subscribe((result) => {
                            if (<any>result.status == 202){
                                console.log("Exists");
                                this.usernameExists = true;
                            } else {
                                console.log("Doesnt exist");
                                this.usernameExists = false;
                            }
                        });
                    } catch (error) {
                        console.log("ERROR while checking username: " + error);
                    }
                    
                } else {
                    this.checkingUsername = true;
                    setTimeout(() => {
                        try {
                            this.backendService.userNameExist(textfield.text)
                                .subscribe((result) => {
                                    if (<any>result.status == 202){
                                        console.log("Exists after debounce");
                                        this.usernameExists = true;
                                    } else {
                                        console.log("Doesnt exist after debounce");
                                        this.usernameExists = false;
                                    }
                                    this.checkingUsername = false;
                                    this.lastCheck = new Date();
                                });
                        } catch (error) {
                        console.log("ERROR while checking username: " + error) ;
                        }
                                
                            }, 500);
                }
            } else {
                this.lastCheck = new Date();
                    try {
                        this.backendService.userNameExist(textfield.text)
                        .subscribe((result) => {
                            if (<any>result.status == 202){
                                console.log("Exists");
                                this.usernameExists = true;
                            } else {
                                console.log("Doesnt exist");
                                this.usernameExists = false;
                            }
                        });
                    } catch (error) {
                        console.log("ERROR while checking username: " + error);
                    }
            }
        }
    }

    getFriendIndex(name: string) {
        return this.friendRequests.findIndex((request) => {
            if (request.name == name){
                console.log(request.name);
                return true;
            }
        });
    }

    declineRequest(name: string) {
        this.backendService.sendFriendRequest(name, "", true);
    }

    animate(content: StackLayout) {
        content.opacity = 0;
        content.animate({
            opacity: 1,
            duration: 500
        })
    }

    removeFriend(name: string){
        let options = {
            title: "Fjerne venn",
            message: "Er du sikker på at du vil fjerne " + name + " fra din venneliste?",
            okButtonText: "Ja", 
            cancelButtonText: "Nei"
        }
        confirm(options).then((result) => {
            if (result) {
                console.log("Removing friend");
                try {
                    this.backendService.sendFriendRequest(name, "", true).subscribe((result) => {
                        console.dir((<any>result));
                    });
                    delete this.friendList[this.getFriendIndex(name)];
                } catch (error) {
                    console.log("ERROR while removing friend: " + error);
                }
            }
        });
    }

    acceptRequest(name: string){
        let friendIndex = this.getFriendIndex(name);
        try {
            this.friendRequests[friendIndex].loading = true;
            this.backendService.sendFriendRequest(name, "accept")
                .subscribe((result) => {
                    if ((<any>result).status == 201){
                        this.friendRequests[friendIndex].loading = false;
                        this.friendList.push(this.friendRequests[friendIndex]);
                        this.friendRequests = this.friendRequests.filter((value, i, array) => {
                            return i != friendIndex;
                        });
                    } else {
                        Toast.makeText("ERROR: " + (<any>result).body.message).show();
                        this.friendRequests[friendIndex].loading = false;
                    }
                }, (error) => {
                    console.log("ERROR while accepting friend request: ");
                    console.dir(error);
                    Toast.makeText("Noe gikk galt, prøv igjen senere").show();
                    this.friendRequests[friendIndex].loading = false;
                });
        } catch (error) {
            console.log("ERROR while accepting friend request: ");
            console.dir(error);
            Toast.makeText("Noe gikk galt, prøv igjen senere").show();
            this.friendRequests[friendIndex].loading = false;
        }
    }

    loadFriends() {
        this.friendRequests = [];
        this.friendList = [];
        try {
            this.backendService.getFriendList()
            .subscribe((result) => {
                if ((<any>result).status == 202){
                    let body = (<any>result).body;
                    console.dir(body);
                    body.friends.forEach(friend => {
                        if (friend.status != "accepted"){
                            this.friendRequests.push({
                                name: friend.name,
                                status: friend.status,
                                loading: false
                            });
                        } else {
                            this.friendList.push(friend);
                        }
                    });
                    this.loading = false;
                } else {
                    Toast.makeText("ERROR: " + (<any>result).body.message).show();
                    this.goBack();
                }
            });
        } catch (error) {
            console.log("ERROR while loading friendList");
            this.success = false;
        }
    }

    ngOnInit(){
        this.loadFriends();

        Toast.makeText("Hallo").show();
    }

}