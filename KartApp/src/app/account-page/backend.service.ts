import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { SettingsService } from '../settings-page/settings.service';


@Injectable({
  providedIn: 'root'
})
export class BackendService {

  constructor(private http: HttpClient, private settings: SettingsService) { 

  }

  private serverURL = "kartapp.pythonanywhere.com";

  login(loginName, password){
    let options = this.createRequestOptions();
    let data = {
      login_name: loginName,
      password: password
    }
    return this.http.post(this.serverURL + "/v1/login", data, {headers: options});
  }

  private createRequestOptions() {
    let headers = new HttpHeaders({
        "Content-Type": "application/json"
    });
    return headers;
}
}
