import { HttpClient } from '@angular/common/http';
// import { Response } from '@angular/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';

/*
  Generated class for the AtmLocationProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AtmLocationProvider {
  private apiTerm: string = 'locations';
  // private url;
  private locurl;
  private locurl_old;

  constructor(public http: HttpClient) {
    console.log('Hello AtmLocationProvider Provider');
    // this.url = 'https://jsonplaceholder.typicode.com/photos';
    this.locurl_old = 'https://getcoins.com/api/locations/index.php';
    this.locurl = 'https://getcoins.com/api/v1/location/read.php';
  }

  //** To get the whole locations by the premature API */
  public getLocationsOld() {
    return this.http.get(this.locurl_old + '?q=' + this.apiTerm);
    // .map((res: Response) => res.json());
    // return this.http.get(this.url + '?albumId=' + albumId);
  }
  //** To get the whole locations by the final API */
  public getLocations() {
    return this.http.get(this.locurl);
    // .map((res: Response) => res.json());
    // return this.http.get(this.url + '?albumId=' + albumId);
  }
  // public getPosts(albumId) {
  //   // return this.http.get(this.locurl)
  //   //   .map((res: Response) => res.json());
  //   return this.http.get(this.url + '?albumId=' + albumId);
  //   // .map((res: Response) => res.json());
  // }
}
