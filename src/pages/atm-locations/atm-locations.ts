import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
// import { internals } from 'rx';

import { ExternalLinkProvider } from '../../providers/external-link/external-link';
import { PopupProvider } from '../../providers/popup/popup';
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

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private translate: TranslateService,
    private externalLinkProvider: ExternalLinkProvider,
    private popupProvider: PopupProvider
  ) {
    this.id = navParams.get('locationId');
    this.data = navParams.get('dataSet');
    this.serverJson = navParams.get('serverJson');
    this.localJson = navParams.get('localJson');
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
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad AtmLocationsPage');
    console.log(this.id);
    console.log(this.data);
    console.log(this.googleUrl);
    console.log(this.serverJson);
    console.log(this.localJson);
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
  public openDirectionPage(): void {
    let url = 'https://maps.googleapis.com/maps/api/directions/json?origin=';
    let optIn = true;
    let title = null;
    let message = this.translate.instant(
      'Go visit our site at www.getcoins.com'
    );
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
}
