import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { SettingsService } from '../settings-page/settings.service';
import * as Toast from 'nativescript-toast';


@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor(private http: HttpClient, private settings: SettingsService) { 

  }

  private serverURL = "https://kartapp.pythonanywhere.com";

  getInfo(){
    // TODO: Kalle createRequestHeader og legge den med i requesten
   
      let headers = this.createRequestHeader();
      return this.http.get(this.serverURL + "/v1/user/all", { headers: headers, observe: "response" });
                    
  }

  getInfo(){
    // TODO: Kalle createRequestHeader og legge den med i requesten
  }

  login(loginName, password){
    let options = this.createRequestOptions();
    let data = {
      email: loginName,
      password: password
    }
    return this.http.post(this.serverURL + "/v1/login", data, {headers: options, observe: "response"});
  }

  register(username,phoneNumber,loginName, password){
    let options=this.createRequestOptions();
    let data = {
      email: loginName,
      password: password,
      username: username, 
      phone:phoneNumber
    }
    return this.http.post(this.serverURL + "/v1/registration", data, {headers: options, observe: "response"});
  }

  logOut(){
    let headers = this.createRequestHeader();
    return this.http.post(this.serverURL + "/v1/logout", undefined, {headers: headers, observe: "response"});
  }


  private createRequestOptions() {
    let headers = new HttpHeaders({
        "Content-Type": "application/json"
    });
    return headers;
  }

  private createRequestHeader() {
    let token = this.settings.getSetting(undefined, 61).value;
    let headers = new HttpHeaders({
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
    });
    return headers;
  }

  getFriendList() {
    try {
      let headers = this.createRequestHeader();
      return this.http.get(this.serverURL + "/v1/friend", {headers: headers, observe: "response"});
    } catch (error) {
      console.log("ERROR while getting friendList in backendService: " + error);
    }
  }

  /**
   * 
   * @param name The username of the user to send the request to
   * @param status The status, send to send a new request, accept to accept a request
   */
  sendFriendRequest(name: string, status: string){
    let headers = this.createRequestHeader();
    let data = {
      friend_name: name,
      status: status
    }
    
    return this.http.post(this.serverURL + "/v1/friend", data, {headers: headers, observe: "response"})
  }

  userNameExist(name: string) {
    let headers = this.createRequestHeader();
    let params = new HttpParams().set("user_name", name);
    return this.http.get(this.serverURL + "/v1/user/exists", {headers: headers, observe: "response", params: params});
  }
}
