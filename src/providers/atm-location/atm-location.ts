import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map'; //** THis is backward compatibility, but not necessary for this app (angular5) */
import 'rxjs/add/operator/toPromise';
import { Logger } from '../../providers/logger/logger';
// import * as jsonData from '../../assets/terms-and-conditions.json'; //** a way to grab the internal json file but not used here */
// import { Response } from '@angular/http';
import { LocationTrackerProvider } from '../../providers/location-tracker/location-tracker';

/*
  Generated class for the AtmLocationProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AtmLocationProvider {
  private apiTerm: string = 'locations';
  // private jsonData: Object = jsonData;
  private locurl: string;
  private apiurl;
  private apiurl_old;
  public results: Object[];
  private geoObjFromHome: any;
  public newResults: any;
  // private offline: boolean = false;

  constructor(
    public http: HttpClient,
    public logger: Logger,
    public locationTracker: LocationTrackerProvider
  ) {
    console.log('Hello AtmLocationProvider Provider');
    this.apiurl_old = 'https://getcoins.com/api/locations/index.php';
    this.apiurl = 'https://getcoins.com/api/v1/location/read.php';
    this.locurl = '../../../../assets/locations.json';
  }

  //** To get the whole locations by the premature API */
  public getLocationsOld() {
    return this.http.get(this.apiurl_old + '?q=' + this.apiTerm);
    // .map((res: Response) => res.json()); //** after Angular 4.3+, with HttpClient, no longer need to parse using response.json() Ref:https://fullstack-developer.academy/angular-http-vs-httpclient/  */
    // return this.http.get(this.url + '?albumId=' + albumId);
  }
  //** To get the whole locations by the final API */
  public getLocations() {
    return this.http.get(this.apiurl);
    // .map((res: Response) => res.json());
  }

  public getLocationsLocal() {
    return this.http.get(this.locurl);
    // return jsonData['locations'];
  }
  //** TO get the location data in promise to then calculate the distance and add it to be object */
  public getLocationsPromise(geoObj, api): Promise<any> {
    this.geoObjFromHome = geoObj;
    if (geoObj.lat !== 0 || geoObj.lng !== 0) {
      let chooseMethod: string;
      if (api) {
        chooseMethod = this.apiurl;
      } else {
        chooseMethod = this.locurl;
      }
      // let geoObj =  { lat: 41.234648, lng: -82.254409 };
      let promise = new Promise((resolve, reject) => {
        this.http
          .get(chooseMethod)
          .toPromise()
          .then(
            res => {
              //** Here you grab the data as array of objects
              // and then loop through to get the distace for each location and then
              // add the new data into the array */
              this.results = res['locations'];
              for (let data of this.results) {
                var distCal = this.getDistance(
                  { lat: data['lat'], lng: data['lng'] },
                  geoObj
                );
                data['distanceMiles'] = distCal;
              }
              //** sort it through via the distanceMiles value */
              this.results.sort(this.compareLatLng);
              resolve(this.results);
            },
            msg => {
              this.logger.warn(msg);
              reject(msg);
            }
          );
      });
      return promise;
    } else {
      this.logger.warn(
        'Your Geolocation is not working. Please enable geolocation to see your closest locations near you.'
      );
      return Promise.reject('Could not get the data you requested');
    }
  }

  //** Sort the order by the specified key comparing two sets of objects */
  public compareLatLng(a, b) {
    //** Make sure to specify the property name (like distanceMiles) as per change */
    const distanceA = a.distanceMiles;
    const distanceB = b.distanceMiles;

    let comparison = 0;
    if (distanceA > distanceB) {
      comparison = 1;
    } else if (distanceA < distanceB) {
      comparison = -1;
    }
    return comparison;
  }

  // // **GCEdit: THIS getDistance func should be moved to provider. Plan to make it happen, then fremove from here.
  // //** calculates distance between two points in km's */
  // // public function calcDistance(p1, p2) {
  // //   return (google.maps.geometry.spherical.computeDistanceBetween(p1, p2) / 1000).toFixed(2);
  // // }

  // //** calculate the distance btwn two points (obj that contins lat and lng) in meters
  // // NOTE: this is not the driving distance but simply dirct distance from point a to b;
  // // hence, it will differ from Google Direction distance */
  public getDistance(p1, p2) {
    // console.log(p1, '<-this is p1');
    // console.log(p2, '<-this is p2');
    function rad(x) {
      return (x * Math.PI) / 180;
    }
    function getMiles(i) {
      return i * 0.000621371192;
    }
    // function getMeters(i) {
    //       return i*1609.344;
    // }
    let R: number = 6378137; // Earth’s mean radius in meter
    //** NOT using goolge map api */
    var dLat = rad(p2.lat - p1.lat);
    var dLong = rad(p2.lng - p1.lng);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(rad(p1.lat)) *
        Math.cos(rad(p2.lat)) *
        Math.sin(dLong / 2) *
        Math.sin(dLong / 2);
    //**Using google map js api */
    // var dLat = rad(p2.lat() - p1.lat());
    // var dLong = rad(p2.lng() - p1.lng());
    // var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    //   Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
    //   Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let d: number = R * c;
    // console.log(d);
    // console.log(getMiles(d));
    let result = getMiles(d);
    // this.locDistanceArr.push({ id: id, dist: result });
    // console.log(this.locDistanceArr, ': is the distance array??');
    return result; // returns the distance in meter
  }

  //** THis needs to work in conjunction with loadGeolocation func above with Promise then */
  public getClosestTenLocations(geoObj, api) {
    if (geoObj.error === null) {
      this.newResults = this.getLocationsPromise(geoObj, api).then(
        //** if the response is okay, meaning the api worked,
        // then you grabbed the new results */
        res => {
          console.log(res, 'this res');
          this.newResults = res;
          console.log(this.newResults, 'this new results');
          // this.loading = true;
          // this.newResultsReady = false;
        },
        //** If the api didnt work, then next grab data
        // from the local data */
        err => {
          this.newResults = this.getLocationsPromise(geoObj, false).then(
            res => {
              console.log(res, 'this res');
              this.newResults = res;
              console.log(this.newResults, 'this new results');
              // this.loading = false;
              // this.newResultsReady = true;
            },
            err => {
              console.log(err);
            }
          );
          console.log(err);
          // this.loading = false;
        }
      );
    } else {
      this.newResults = null;
      console.log(this.newResults, ' must be null and not success');
      this.logger.warn(
        'Your geolocation is turned off. To better assist you, please eneable the geolocation.'
      );
    }
  }
}
