import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import 'rxjs/add/operator/filter';
import { Logger } from '../../providers/logger/logger';
// import { AtmLocationProvider } from '../../providers/atm-location/atm-location';

/*
  Generated class for the LocationTrackerProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class LocationTrackerProvider {
  public watch: any;
  public lat: number = 0;
  public lng: number = 0;
  public toggleStart: boolean = false;
  public toggleStop: boolean = false;

  constructor(
    public http: HttpClient,
    public zone: NgZone,
    public geolocation: Geolocation,
    public backgroundGeolocation: BackgroundGeolocation,
    public logger: Logger // public atmLocationProvider: AtmLocationProvider
  ) {
    this.logger.info('Hello LocationTrackerProvider Provider');
  }

  public startTracking(callback: (lat: number, lng: number) => any) {
    this.toggleStart = true;

    // setInterval(() => {
    //   this.updateNewResults();
    //   console.log('every 5ec tracking started!');
    // }, 5 * 1000); // 60 * 1000 milsec
    // Background Tracking
    let config = {
      desiredAccuracy: 0,
      stationaryRadius: 20,
      distanceFilter: 10,
      debug: true,
      interval: 2000
    };

    this.backgroundGeolocation.configure(config).subscribe(
      location => {
        // console.log(
        //   'BackgroundGeolocation:  ' +
        //     location.latitude +
        //     ',' +
        //     location.longitude
        // );
        this.logger.info(
          'BackgroundGeolocation:  ' +
            location.latitude +
            ',' +
            location.longitude
        );

        // Run update inside of Angular's zone
        this.zone.run(() => {
          this.lat = location.latitude;
          this.lng = location.longitude;
          // this.atmLocationProvider.updateNewResults(this.lat, this.lng);//** this cause a huge error with "cannot access uninitialized values" or "AtmLocationProvider cannot access". THis is due to calling atmLocationProvider inside another provider, location-tracker, and vice versa, and they are both used in home.ts, causing the error forever looping..*/
          callback(this.lat, this.lng);
        });
      },
      err => {
        // console.log(err);
        this.logger.warn(err);
      }
    );

    // Turn ON the background-geolocation system.
    this.backgroundGeolocation.start();

    // Foreground Tracking

    let options = {
      frequency: 3000,
      enableHighAccuracy: true
    };

    this.watch = this.geolocation
      .watchPosition(options)
      .filter((p: any) => p.code === undefined)
      .subscribe((position: Geoposition) => {
        // console.log(position);

        // Run update inside of Angular's zone
        this.zone.run(() => {
          this.lat = position.coords.latitude;
          this.lng = position.coords.longitude;
          callback(this.lat, this.lng);
        });
      });
  }

  stopTracking() {
    this.toggleStop = true;
    // console.log('stopTracking');

    this.backgroundGeolocation.finish();
    this.watch.unsubscribe();
  }
}
