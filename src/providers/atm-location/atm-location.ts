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
  private url;
  private locurl;
  constructor(public http: HttpClient) {
    console.log('Hello AtmLocationProvider Provider');
    this.url = 'https://jsonplaceholder.typicode.com/photos';
    this.locurl = 'https://getcoins.com/api/locations/index.php';
  }

  public getLocations() {
    return this.http.get(this.locurl + '?q=' + this.apiTerm);
    // .map((res: Response) => res.json());
    // return this.http.get(this.url + '?albumId=' + albumId);
  }
  public getPosts(albumId) {
    // return this.http.get(this.locurl)
    //   .map((res: Response) => res.json());
    return this.http.get(this.url + '?albumId=' + albumId);
    // .map((res: Response) => res.json());
  }
}
