import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { InAppBrowser } from '@ionic-native/in-app-browser';
// import { internals } from 'rx';
// import { Geolocation } from '@ionic-native/geolocation';

import { ExternalLinkProvider } from '../../providers/external-link/external-link';
// import { PopupProvider } from '../../providers/popup/popup';
/**
 * Generated class for the AtmLocationsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-atm-locations',
  templateUrl: 'atm-locations.html'
})
export class AtmLocationsPage {
  private id: number;
  private serverJson: any;
  private localJson: any;
  private data: any;
  private googleMapAPIKey: string = 'AIzaSyB43uqfV0AdFqBJ-MasTqVwtuNLFasOxPg';
  public googleUrl: string;
  private encodedAddress: string;
  public gcATMName: string = 'GetCoins Bitcoin ATM';
  public googleDirectionUrl: string;
  public encodedDirection: string;
  public googleDirUrl: string;
  // public myLocation: object = { lat: 41.234648, lng: -82.254409 };
  public myLocation: object;
  public encodedMyLocation: string;
  public travelMode: string = 'driving';
  public address: string;
  public hours: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private translate: TranslateService,
    private externalLinkProvider: ExternalLinkProvider,
    // private popupProvider: PopupProvider,
    private iab: InAppBrowser
  ) // private geo: Geolocation
  {
    this.id = navParams.get('locationId');
    this.data = navParams.get('dataSet');
    this.serverJson = navParams.get('serverJson');
    this.localJson = navParams.get('localJson');
    this.myLocation = navParams.get('geolocation');
    this.encodedAddress = encodeURIComponent(
      this.gcATMName +
        ' ' +
        this.data.street +
        ' ' +
        this.data.city +
        ', ' +
        this.data.state +
        ' ' +
        this.data.zipcode
    );
    this.encodedMyLocation = encodeURIComponent(
      this.myLocation['lat'] + ',' + this.myLocation['lng']
    );
    this.encodedDirection = encodeURIComponent(
      this.gcATMName +
        ' ' +
        this.data.street +
        ' ' +
        this.data.city +
        ', ' +
        this.data.state +
        ' ' +
        this.data.zipcode
    );
    this.googleUrl =
      'https://www.google.com/maps/embed/v1/place?key=' +
      this.googleMapAPIKey +
      '&q=' +
      this.encodedAddress +
      '&zoom=14';

    this.googleDirUrl =
      'https://www.google.com/maps/dir/?api=1&origin=' +
      this.encodedMyLocation +
      '&destination=' +
      this.encodedDirection +
      '&travelmode=' +
      this.travelMode;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AtmLocationsPage');
    console.log(this.id);
    console.log(this.data);
    console.log(this.googleUrl);
    console.log(this.googleDirUrl);
    console.log(this.serverJson);
    console.log(this.localJson);
    console.log(this.myLocation);
  }

  // private openDirectionPage() {
  //   let message = this.translate.instant(
  //     'Open a Google Map Direction page!'
  //   );
  //   let title = this.translate.instant('Get Direction');
  //   let okText = this.translate.instant('GO!');
  //   let cancelText = this.translate.instant('Go back');
  //   this.popupProvider
  //     .ionicConfirm(title, message, okText, cancelText)
  //     .then(ok => {
  //       if (ok) {

  //       } else {

  //       }
  //     });
  // }
  //** One way to take user to the Direction external page; by simply moving to a new browser */
  public getDirectionPage(): void {
    const browser = this.iab.create(this.googleDirUrl, '_blank');
    browser.show();
  }
  //** Another way to take user to the Direction external page; by showing the msg to then open the browser */
  public openDirectionLink(): void {
    let url = this.googleDirUrl;
    let optIn = true;
    let title = null;
    let message = this.translate.instant('Open Google Map');
    let okText = this.translate.instant('Direction');
    let cancelText = this.translate.instant('Go Back');
    this.externalLinkProvider.open(
      url,
      optIn,
      title,
      message,
      okText,
      cancelText
    );
  }
  public callCustomerSupport(): void {
    let url = 'tel:+1-860-800-2646';
    let optIn = true;
    let title = null;
    let message = this.translate.instant('You can call us now at 860-800-2646');
    let okText = this.translate.instant('Call');
    let cancelText = this.translate.instant('Go Back');
    this.externalLinkProvider.open(
      url,
      optIn,
      title,
      message,
      okText,
      cancelText
    );
  }
}
