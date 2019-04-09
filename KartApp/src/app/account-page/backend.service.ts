import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { SettingsService } from '../settings-page/settings.service';


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
      return this.http.get(this.serverURL + "/v1/user/all", { headers: headers });
                    
  }

  

  login(loginName, password){
    let options = this.createRequestOptions();
    let data = {
      email: loginName,
      password: password
    }
    return this.http.post(this.serverURL + "/v1/login", data, {headers: options, observe: "response"});
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
        "Bearer": token,
        "Content-Type": "application/json",
     });

    return headers;
  }
}
