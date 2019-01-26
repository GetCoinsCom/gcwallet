import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';
import 'rxjs/add/operator/map'; //** THis is backward compatibility, but not necessary for this app (angular5) */
import 'rxjs/add/operator/toPromise';
import { Logger } from '../../providers/logger/logger';
import { LocationTrackerProvider } from '../../providers/location-tracker/location-tracker';
// import * as jsonData from '../../assets/locations.json'; //** a way to grab the internal json file but not used here */

/*
  Generated class for the AtmLocationProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class AtmLocationProvider {
  private locurl: string;
  private locurlForBrowser: string;
  private apiurl;
  // private apiurl_old;
  // private apiTerm: string = 'locations'; // ** for old api
  public results: Object[];
  public newResults: any;

  constructor(
    public http: HttpClient,
    private platform: Platform,
    public logger: Logger,
    public locationTracker: LocationTrackerProvider
  ) {
    console.log('Hello AtmLocationProvider Provider');
    // this.apiurl_old = 'https://getcoins.com/api/locations/index.php';
    this.apiurl = 'https://getcoins.com/api/v1/location/read.php';
    this.locurl = 'assets/locations.json';
    this.locurlForBrowser = '../../../../assets/locations.json';
  }

  // /**
  //  * Get the whole locations by the premature API
  //  * Not Used as of Jan 25, 2019
  //  */
  // public getLocationsOld() {
  //   return this.http.get(this.apiurl_old + '?q=' + this.apiTerm);
  //   // .map((res: Response) => res.json()); //** after Angular 4.3+, with HttpClient, no longer need to parse using response.json() Ref:https://fullstack-developer.academy/angular-http-vs-httpclient/  */
  // }

  //** To get the whole locations by the final API */
  /**
   * Get the whole locations by the final API
   */
  public getLocations() {
    return this.http.get(this.apiurl);
    // .map((res: Response) => res.json());
  }

  /**
   * Get the whole locations from the local json file
   */
  public getLocationsLocal() {
    if (this.platform.is('cordova')) {
      // make your native API calls
      return this.http.get(this.locurl);
    } else {
      return this.http.get(this.locurlForBrowser);
    }
  }
  //** TO get the location data in promise to then calculate the distance and add it to be object */

  /**
   * Get the location data in Promise to then calculate the distance
   * and add it to each object in the array
   * @param geoObj: object
   * @param api: boolean
   * @returns
   */
  public getLocationsPromise(geoObj, api): Promise<any> {
    // ** If geolocation lat or lng is not 0 (meaning geolocation was indeed available),
    // **
    if (geoObj.lat !== 0 || geoObj.lng !== 0) {
      // ** Find the choosed api url
      let chooseMethod: string;
      if (api) {
        chooseMethod = this.apiurl;
      } else {
        chooseMethod = this.locurl;
      }
      // let geoObj =  { lat: 41.234648, lng: -82.254409 }; // ** For testing purpose
      let promise = new Promise((resolve, reject) => {
        this.http
          .get(chooseMethod)
          .toPromise()
          .then(
            res => {
              // ** Here you grab the data as array of objects
              // ** and then loop through to get the distace for each location and then
              //**  add the new data into the array */

              // ** res will get returned even if the data from api is missing, so here you check if the data is indeed null or not. If null then grab from local json anyhow */
              if (res === null) {
                // ** check if cordova is in use or browser
                if (this.platform.is('cordova')) {
                  // make your native API calls
                  this.http
                    .get(this.locurl)
                    .toPromise()
                    .then(
                      res => {
                        if (res === null) {
                          this.results = null;
                        } else {
                          this.results = res['locations'];
                          // ** Here you grab the lat and lng data and calculate the distance,
                          // ** and then store it back to the data
                          for (let data of this.results) {
                            var distCal = this.getDistance(
                              { lat: data['lat'], lng: data['lng'] },
                              geoObj
                            );
                            data['distanceMiles'] = distCal;
                          }
                          //** sort it through via the distanceMiles value */
                          this.results.sort(this.compareLatLng);
                          // ** resolve the newly structured results
                          resolve(this.results);
                        }
                      },
                      err => {
                        this.logger.warn(
                          err,
                          ': Could not retrieve location data.'
                        );
                        this.results = null;
                        reject(this.results);
                      }
                    );
                }
                // ** If cordova wanst use, then fallback to browser APIs
                else {
                  this.http
                    .get(this.locurlForBrowser)
                    .toPromise()
                    .then(
                      res => {
                        if (res === null) {
                          this.results = null;
                        } else {
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
                        }
                      },
                      err => {
                        this.logger.warn(
                          err,
                          ': Could not retrieve location data.'
                        );
                        this.results = null;
                        reject(this.results);
                      }
                    );
                }
              }
              //** If the response is not null and indeed was data from api as we expected */
              else {
                this.results = res['locations'];
                // ** Same as above in if stmt, loop throught the results, calculate the distance
                // ** and put it into the results
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
              }
            },
            msg => {
              this.logger.warn(msg);
              reject(msg);
            }
          );
      });
      return promise;
    }
    //** If there is no geolocation, then no point or way in showing "closest" location, so show the error */
    else {
      this.logger.warn(
        'Your Geolocation is not working. Please enable geolocation to see your closest locations near you.'
      );
      return Promise.reject('Could not get the data you requested');
    }
  }

  /**
   * Sort the order by the specified key, comparing two sets of objects
   * (NOTE: the property name passed to both parameters need to be equal to
   * the property name you specified above in the getLocationsPromise func)
   * @param o1: object
   * @param o2: object
   */
  public compareLatLng(o1, o2) {
    //** Make sure to specify the property name (like distanceMiles) as per change */
    const distanceA = o1.distanceMiles;
    const distanceB = o2.distanceMiles;

    let comparison = 0;
    if (distanceA > distanceB) {
      comparison = 1;
    } else if (distanceA < distanceB) {
      comparison = -1;
    }
    return comparison;
  }

  // /**
  //  * Google map API way of calculating the distance between two poins in km's
  //  * Not used as of Jan 25, 2019
  //  * @param p1
  //  * @param p2
  //  */
  // public calcDistance(p1, p2) {
  //   return (google.maps.geometry.spherical.computeDistanceBetween(p1, p2) / 1000).toFixed(2);
  // }

  /**
   * Simply calculate the distance between two points (obj that contains lat and lng) in meters
   * (NOTE: this is not the driving distance but simply dirct distance from point a to b;
   * hence, it will differ from Google Direction distance )
   * @param p1
   * @param p2
   */
  public getDistance(p1, p2) {
    function rad(x) {
      return (x * Math.PI) / 180;
    }
    function getMiles(i) {
      return i * 0.000621371192;
    }
    let R: number = 6378137; // Earth’s mean radius in meter
    // ** NOT using goolge map api */
    var dLat = rad(p2.lat - p1.lat);
    var dLong = rad(p2.lng - p1.lng);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(rad(p1.lat)) *
        Math.cos(rad(p2.lat)) *
        Math.sin(dLong / 2) *
        Math.sin(dLong / 2);
    // **Using google map js api */
    // var dLat = rad(p2.lat() - p1.lat());
    // var dLong = rad(p2.lng() - p1.lng());
    // var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    //   Math.cos(rad(p1.lat())) * Math.cos(rad(p2.lat())) *
    //   Math.sin(dLong / 2) * Math.sin(dLong / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let d: number = R * c;

    // ** convert meters to miles
    let result = getMiles(d);

    return result; // returns the distance in miles
  }

  /**
   * This part is in home.ts directly.
   */
  // //** THis needs to work in conjunction with loadGeolocation func above with Promise then */
  // public getClosestTenLocations(geoObj, api) {
  //   if (geoObj.error === null) {
  //     this.newResults = this.getLocationsPromise(geoObj, api).then(
  //       //** if the response is okay, meaning the api worked,
  //       // then you grabbed the new results */
  //       res => {
  //         console.log(res, 'this res');
  //         this.newResults = res;
  //         console.log(this.newResults, 'this new results');
  //         // this.loading = true;
  //         // this.newResultsReady = false;
  //       },
  //       //** If the api didnt work, then next grab data
  //       // from the local data */
  //       err => {
  //         this.newResults = this.getLocationsPromise(geoObj, false).then(
  //           res => {
  //             console.log(res, 'this res');
  //             this.newResults = res;
  //             console.log(this.newResults, 'this new results');
  //             // this.loading = false;
  //             // this.newResultsReady = true;
  //           },
  //           err => {
  //             console.log(err);
  //           }
  //         );
  //         console.log(err);
  //         // this.loading = false;
  //       }
  //     );
  //   } else {
  //     this.newResults = null;
  //     console.log(this.newResults, ' must be null and not success');
  //     this.logger.warn(
  //       'Your geolocation is turned off. To better assist you, please eneable the geolocation.'
  //     );
  //   }
  // }
}
