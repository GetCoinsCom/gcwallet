import { Component, NgZone, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  Events,
  ModalController,
  NavController,
  Platform,
  AlertController
} from 'ionic-angular';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as localJsonFile from '../../assets/locations.json';

// Pages
import { AddPage } from '../add/add';
import { CopayersPage } from '../add/copayers/copayers';
import { AmazonPage } from '../integrations/amazon/amazon';
import { BitPayCardPage } from '../integrations/bitpay-card/bitpay-card';
import { BitPayCardIntroPage } from '../integrations/bitpay-card/bitpay-card-intro/bitpay-card-intro';
import { CoinbasePage } from '../integrations/coinbase/coinbase';
import { GlideraPage } from '../integrations/glidera/glidera';
import { MercadoLibrePage } from '../integrations/mercado-libre/mercado-libre';
import { ShapeshiftPage } from '../integrations/shapeshift/shapeshift';
import { TxDetailsPage } from '../tx-details/tx-details';
import { TxpDetailsPage } from '../txp-details/txp-details';
import { WalletDetailsPage } from '../wallet-details/wallet-details';
import { ActivityPage } from './activity/activity';
import { ProposalsPage } from './proposals/proposals';
import { AtmLocationsPage } from '../atm-locations/atm-locations';
// import { SupportCardPage } from '../includes/support-card/support-card';

// Providers
import { AddressBookProvider } from '../../providers/address-book/address-book';
import { AppProvider } from '../../providers/app/app';
import { BitPayCardProvider } from '../../providers/bitpay-card/bitpay-card';
import { BwcErrorProvider } from '../../providers/bwc-error/bwc-error';
import { ConfigProvider } from '../../providers/config/config';
import { EmailNotificationsProvider } from '../../providers/email-notifications/email-notifications';
import { ExternalLinkProvider } from '../../providers/external-link/external-link';
import { FeedbackProvider } from '../../providers/feedback/feedback';
import { HomeIntegrationsProvider } from '../../providers/home-integrations/home-integrations';
import { Logger } from '../../providers/logger/logger';
import { OnGoingProcessProvider } from '../../providers/on-going-process/on-going-process';
import { PersistenceProvider } from '../../providers/persistence/persistence';
import { PlatformProvider } from '../../providers/platform/platform';
import { PopupProvider } from '../../providers/popup/popup';
import { ProfileProvider } from '../../providers/profile/profile';
import { ReleaseProvider } from '../../providers/release/release';
import { ReplaceParametersProvider } from '../../providers/replace-parameters/replace-parameters';
import { WalletProvider } from '../../providers/wallet/wallet';
import { AtmLocationProvider } from '../../providers/atm-location/atm-location';
import {
  Geolocation,
  GeolocationOptions,
  Geoposition,
  PositionError
} from '@ionic-native/geolocation';
import { LocationTrackerProvider } from '../../providers/location-tracker/location-tracker';
import { OpenNativeSettings } from '@ionic-native/open-native-settings';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  @ViewChild('showCard')
  showCard;
  public wallets;
  public walletsBtc;
  public walletsBch;
  public cachedBalanceUpdateOn: string;
  public recentTransactionsEnabled: boolean;
  public txps;
  public txpsN: number;
  public notifications;
  public notificationsN: number;
  public serverMessage;
  public addressbook;
  public newRelease: boolean;
  public updateText: string;
  public homeIntegrations;
  public bitpayCardItems;
  public showBitPayCard: boolean = false;

  public showRateCard: boolean;
  public homeTip: boolean;
  public showReorderBtc: boolean;
  public showReorderBch: boolean;
  public showIntegration;

  private isNW: boolean;
  private updatingWalletId: object;
  private zone;

  private locations: any;
  public localJson: any;
  public myLocation: any; //**GCEdit: DO NOT CHANGE THE TYPE HERE TO OBJECT (unless you change the scheme of the variable) */
  public locationsLatLng: any;
  public tenLocations: any;
  public allLocDistanceArr: any = [];
  public options: GeolocationOptions;
  public currentPos: Geoposition;
  public watch: any;
  public loading: boolean;
  public newResults: any;
  public offline: boolean;
  public newResultsReady: boolean = false;
  public toggledStart: boolean = false;
  // public toggledStop: boolean = false;

  public orangeColor: string = '#f79420';
  public grayColor: string = '#495057';
  public redWarning: string = '#ef473a';

  constructor(
    private plt: Platform,
    private navCtrl: NavController,
    private profileProvider: ProfileProvider,
    private releaseProvider: ReleaseProvider,
    private walletProvider: WalletProvider,
    private bwcErrorProvider: BwcErrorProvider,
    private logger: Logger,
    private events: Events,
    private configProvider: ConfigProvider,
    private externalLinkProvider: ExternalLinkProvider,
    private onGoingProcessProvider: OnGoingProcessProvider,
    private popupProvider: PopupProvider,
    private modalCtrl: ModalController,
    private addressBookProvider: AddressBookProvider,
    private appProvider: AppProvider,
    private platformProvider: PlatformProvider,
    private homeIntegrationsProvider: HomeIntegrationsProvider,
    private persistenceProvider: PersistenceProvider,
    private feedbackProvider: FeedbackProvider,
    private bitPayCardProvider: BitPayCardProvider,
    private translate: TranslateService,
    private emailProvider: EmailNotificationsProvider,
    private replaceParametersProvider: ReplaceParametersProvider,
    private atmLocationProvider: AtmLocationProvider,
    public alertCtrl: AlertController,
    public geo: Geolocation,
    public locationTracker: LocationTrackerProvider,
    private openNativeSettings: OpenNativeSettings
  ) {
    this.updatingWalletId = {};
    this.addressbook = {};
    this.cachedBalanceUpdateOn = '';
    this.isNW = this.platformProvider.isNW;
    this.showReorderBtc = false;
    this.showReorderBch = false;
    this.zone = new NgZone({ enableLongStackTrace: false });
    this.localJson = localJsonFile['locations'];
    this.loading = true;
    this.offline = false;
    console.log(this.loading, ' is loading');
  }

  ionViewDidLoad() {
    this.loading = true;
    this.logger.info('ionViewDidLoad HomePage');
    this.getAPIdata();
    console.log(this.loading, ' is loading');

    this.checkEmailLawCompliance();

    // Create, Join, Import and Delete -> Get Wallets -> Update Status for All Wallets
    this.events.subscribe('status:updated', () => {
      this.updateTxps();
      this.setWallets();
    });

    this.plt.resume.subscribe(() => {
      this.getNotifications();
      this.updateTxps();
      this.setWallets();
    });

    this.loadGeolocation().then(
      res => {
        console.log(res, ' is response from loadGeolocation func');
        if (res.error === null) {
          this.offline = false;
          console.log('not error so go on grabbing closest locations');
          this.getClosestTenLocations(res, true);
        } else {
          this.offline = true;
          console.log('geolocation was null, so grabbing from false');
          this.getClosestTenLocations(res, false);
          this.loading = false;
        }
      },
      err => {
        console.log(err, ' is error response from loadGeolocation func');
        console.log('now we should get the closest from the local file');
        this.getClosestTenLocations(err, false);
        this.loading = false;
      }
    );
    console.log(this.loading, ' is loading');
    console.log(
      this.atmLocationProvider.results,
      ' is the results from the provider'
    );
    // this.watchGeolocation();
  }

  ionViewWillEnter() {
    this.recentTransactionsEnabled = this.configProvider.get().recentTransactions.enabled;

    // Update list of wallets, status and TXPs
    this.setWallets();

    this.addressBookProvider
      .list()
      .then(ab => {
        this.addressbook = ab || {};
      })
      .catch(err => {
        this.logger.error(err);
      });

    // Update Tx Notifications
    this.getNotifications();
    console.log(this.loading, ' is loading');
  }

  ionViewDidEnter() {
    if (this.isNW) this.checkUpdate();
    this.checkHomeTip();
    this.checkFeedbackInfo();

    // BWS Events: Update Status per Wallet
    // NewBlock, NewCopayer, NewAddress, NewTxProposal, TxProposalAcceptedBy, TxProposalRejectedBy, txProposalFinallyRejected,
    // txProposalFinallyAccepted, TxProposalRemoved, NewIncomingTx, NewOutgoingTx
    this.events.subscribe('bwsEvent', (walletId: string) => {
      this.getNotifications();
      this.updateWallet(walletId);
    });

    // Show integrations
    let integrations = _.filter(this.homeIntegrationsProvider.get(), {
      show: true
    });

    // Hide BitPay if linked
    setTimeout(() => {
      this.homeIntegrations = _.remove(_.clone(integrations), x => {
        if (x.name == 'debitcard' && x.linked) return;
        else return x;
      });
    }, 200);

    // Only BitPay Wallet
    this.bitPayCardProvider.get({}, (_, cards) => {
      this.zone.run(() => {
        this.showBitPayCard = this.appProvider.info._enabledExtensions.debitcard
          ? true
          : false;
        this.bitpayCardItems = cards;
      });
    });
    // if (this.locationTracker.toggleStart) {
    //   console.log('every 5ec tracking started!');
    //   setInterval(() => {
    //     this.updateNewResults();
    //     console.log('every 5ec tracking started!');
    //   }, 5 * 1000); // 60 * 1000 milsec
    // }
  }

  ionViewWillLeave() {
    this.events.unsubscribe('bwsEvent');
  }

  // let getLocFromLocal =
  public getLocalJsonInstead() {
    this.atmLocationProvider.getLocationsLocal().subscribe(data => {
      this.locations = data['locations'];
      // console.log(this.locations, ' from the first local call');
    });
  }
  public getAPIdata() {
    console.log('getAPIdata entered now');
    // this.getLocalJsonInstead();
    let observableAPI = this.atmLocationProvider.getLocations();
    //** Get all ATM locations from API */
    observableAPI.subscribe(
      data => {
        this.locations = data['locations'];
      },
      err => {
        this.getLocalJsonInstead();
        console.log('mmm.. not success from api but from local should work');
        this.logger.warn('HTTP Error', err);
      }
    );
  }

  //** get and watch user's geolocation  */
  public loadGeolocation(): Promise<any> {
    this.loading = true;

    this.options = {
      enableHighAccuracy: true
    };

    let getPosition = this.geo.getCurrentPosition(this.options).then(
      (pos: Geoposition) => {
        console.log(
          pos,
          ' this is the position returned from the promise func'
        );
        this.myLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          error: null
        };
        // let test = this.checkit(this.myLocation);
        // console.log(test, 'is the test results');
        // // this.newResults
        console.log(pos, ' is the geoposition pos');
        console.log(this.myLocation, ' is my location??');
        // console.log(this.newResults);
        return this.myLocation;
      },
      (err: PositionError) => {
        this.myLocation = {
          lat: 0,
          lng: 0,
          error: err.message
        };
        console.log(this.myLocation);
        console.log('error : ' + err.message);
        return this.myLocation;
      }
    );
    return getPosition;
    // ).then(
    //   res => {
    //     this.newResults = this.atmLocationProvider
    //       .getLocationsPromise(res, true)
    //       .then(
    //         res => {
    //           console.log(res, 'this res');
    //           this.newResults = res;
    //           console.log(this.newResults, 'this new results');
    //           this.loading = false;
    //         },
    //         err => {
    //           this.newResults = this.atmLocationProvider
    //             .getLocationsPromise(this.myLocation, true)
    //             .then(
    //               res => {
    //                 console.log(res, 'this res');
    //                 this.newResults = res;
    //                 console.log(this.newResults, 'this new results');
    //               },
    //               err => {
    //                 console.log(err);
    //               }
    //             );
    //           console.log(err);
    //           this.loading = false;
    //         }
    //       );
    //   },
    //   msg => {
    //     console.log(msg);
    //   }
    // );
    // this.geo
    //   .getCurrentPosition()
    //   .then(res => {
    //     console.log('geolocation response!');
    //     // res.coords.latitude
    //     // res.coords.longitude
    //     this.myLocation = {
    //       lat: res.coords.latitude,
    //       lng: res.coords.longitude
    //       // error: null
    //     };
    //     console.log(res, 'is what we get');
    //     console.log(this.myLocation, 'is my object');
    //   })
    //   .catch(error => {
    //     this.myLocation = {
    //       lat: 0,
    //       lng: 0
    //       // error: error
    //     };
    //     console.log('Error getting location', error);
    //     console.log(this.myLocation, 'is my object');
    //   });
  }
  public watchGeolocation() {
    console.log(this.myLocation, ' is this.myLocation');
    this.watch = this.geo.watchPosition();
    this.watch.subscribe(
      data => {
        // data can be a set of coordinates, or an error (if an error occurred).
        // data.coords.latitude
        // data.coords.longitude
        console.log(data, ' is watched geo data');
        this.myLocation = {
          lat: data.coords.latitude,
          lng: data.coords.longitude,
          error: null
        };
      },
      err => {
        console.log(err, ' is error from watchGeolocation');
        // this.myLocation = {
        //   lat: this.myLocation.lat,
        //   lng: this.myLocation.lng,
        //   error: err
        // };
      }
    );
  }
  //** Open device specific setting (Settings page) to enable Geolocation when users dont have it on by default */
  public open(setting: string) {
    this.openNativeSettings
      .open(setting)
      .then(res => {
        console.log(res, ' the setting indeed opened');
      })
      .catch(err => {
        console.log(JSON.stringify(err), ': there was error');
      });
  }
  //** THis needs to work in conjunction with loadGeolocation func above with Promise then */
  public getClosestTenLocations(geoObj, api) {
    this.loading = true;
    if (geoObj.error === null) {
      this.newResults = this.atmLocationProvider
        .getLocationsPromise(geoObj, api)
        .then(
          //** if the response is okay, meaning the api worked,
          // then you grabbed the new results */
          res => {
            console.log(res, 'this res');
            this.newResults = res;
            console.log(this.newResults, 'this new results');
            this.loading = false;
            this.newResultsReady = true;
          },
          //** If the api didnt work, then next grab data
          // from the local data */
          err => {
            this.newResults = this.atmLocationProvider
              .getLocationsPromise(geoObj, false)
              .then(
                res => {
                  console.log(res, 'this res');
                  this.newResults = res;
                  console.log(this.newResults, 'this new results');
                  this.loading = false;
                  this.newResultsReady = true;
                },
                err => {
                  console.log(err);
                }
              );
            console.log(err);
            this.loading = false;
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

  // public getOnlyTenLocations(): void {
  //   var dataArr: any;
  //   // let currLat = dataArr[0].lat;
  //   // let currLng = dataArr[0].lng;

  //   this.atmLocationProvider.getLocations().subscribe(data => {
  //     // console.log(data['locations'], ' is the data from getOnlyTenLocations');
  //     dataArr = data['locations'];
  //     console.log(dataArr, ' inside atmData');
  //     // var diffLat;
  //     // var diffLng;
  //     // for (let item of dataArr) {
  //     //   diffLat = Math.abs(this.myLocation.lat - item.lat);
  //     //   diffLng = Math.abs(this.myLocation.lng - item.lng);
  //     //   this.allLocDistanceArr.push({
  //     //     id: item.id,
  //     //     lat: item.lat,
  //     //     lng: item.lng,
  //     //     diffLat: diffLat,
  //     //     diffLng: diffLng
  //     //   });
  //     // }
  //   });

  //   // let atmData = this.atmLocationProvider.getLocations().subscribe(data => {
  //   //   // console.log(data['locations'], ' is the data from getOnlyTenLocations');
  //   //   dataArr = data['locations'];
  //   //   console.log(dataArr, ' inside atmData');
  //   //   // var diffLat;
  //   //   // var diffLng;
  //   //   // for (let item of dataArr) {
  //   //   //   diffLat = Math.abs(this.myLocation.lat - item.lat);
  //   //   //   diffLng = Math.abs(this.myLocation.lng - item.lng);
  //   //   //   this.allLocDistanceArr.push({
  //   //   //     id: item.id,
  //   //   //     lat: item.lat,
  //   //   //     lng: item.lng,
  //   //   //     diffLat: diffLat,
  //   //   //     diffLng: diffLng
  //   //   //   });
  //   //   // }
  //   // });
  //   console.log(dataArr, ' does this run only once? dataArr');
  //   return dataArr;
  //   // console.log(this.allLocDistanceArr, ' is all Lat/Lng data');
  //   // return this.allLocDistanceArr;
  // }

  public updateNewResults(lat: number, lng: number) {
    console.log('updateNewReslts func run!');
    if (this.locationTracker.toggleStart) {
      console.log(
        'updateNewReslts func inside IF stmt; meaning myLocation was defined and not null???'
      );
      if (this.myLocation['lat'] !== lat && this.myLocation['lng'] !== lng) {
        let originalMyLoc = this.myLocation;
        this.myLocation = {
          lat: lat,
          lng: lng,
          error: null
        };
        console.log(
          this.myLocation,
          ': myLocation must have been chnaged from ->',
          originalMyLoc
        );
        this.getClosestTenLocations(this.myLocation, true);
      } else {
        //** do nothing */
        console.log('no change in myLocation');
      }
    } else {
      console.log('updateNewResults will leave not bc tracker is not on');
    }
  }
  public startTrack() {
    this.openStartTrackMsg();
  }
  private openStartTrackMsg() {
    let message = this.translate.instant(
      'Would you like to start tracking your location?'
    );
    let title = this.translate.instant('Start Track');
    let okText = this.translate.instant('Start');
    let cancelText = this.translate.instant('Go back');
    this.popupProvider
      .ionicConfirm(title, message, okText, cancelText)
      .then(ok => {
        if (ok) {
          // Stop tracking user's location
          this.locationTracker.startTracking(this.updateNewResults);
          this.toggledStart = true;
        } else {
          // Do nothing
          this.toggledStart = false;
        }
      });
  }

  public stopTrack() {
    this.openStopTrackMsg();
  }
  private openStopTrackMsg() {
    let message = this.translate.instant(
      'Would you like to stop tracking your location?'
    );
    let title = this.translate.instant('Stop Track');
    let okText = this.translate.instant('Stop');
    let cancelText = this.translate.instant('Go back');
    this.popupProvider
      .ionicConfirm(title, message, okText, cancelText)
      .then(ok => {
        if (ok) {
          // Stop tracking user's location
          this.locationTracker.stopTracking();
          this.toggledStart = false;
        } else {
          // Just change the setting
          this.toggledStart = true;
        }
      });
  }

  private openEmailDisclaimer() {
    let message = this.translate.instant(
      'By providing your email address, you give explicit consent to BitPay to use your email address to send you email notifications about payments.'
    );
    let title = this.translate.instant('Privacy Policy update');
    let okText = this.translate.instant('Accept');
    let cancelText = this.translate.instant('Disable notifications');
    this.popupProvider
      .ionicConfirm(title, message, okText, cancelText)
      .then(ok => {
        if (ok) {
          // Accept new Privacy Policy
          this.persistenceProvider.setEmailLawCompliance('accepted');
        } else {
          // Disable email notifications
          this.persistenceProvider.setEmailLawCompliance('rejected');
          this.emailProvider.updateEmail({
            enabled: false,
            email: 'null@email'
          });
        }
      });
  }

  private checkEmailLawCompliance(): void {
    setTimeout(() => {
      if (this.emailProvider.getEmailIfEnabled()) {
        this.persistenceProvider.getEmailLawCompliance().then(value => {
          if (!value) this.openEmailDisclaimer();
        });
      }
    }, 2000);
  }

  private startUpdatingWalletId(walletId: string) {
    this.updatingWalletId[walletId] = true;
  }

  private stopUpdatingWalletId(walletId: string) {
    setTimeout(() => {
      this.updatingWalletId[walletId] = false;
    }, 10000);
  }

  private setWallets = _.debounce(
    () => {
      this.wallets = this.profileProvider.getWallets();
      this.walletsBtc = _.filter(this.wallets, (x: any) => {
        return x.credentials.coin == 'btc';
      });
      this.walletsBch = _.filter(this.wallets, (x: any) => {
        return x.credentials.coin == 'bch';
      });
      this.updateAllWallets();
    },
    5000,
    {
      leading: true
    }
  );

  public checkHomeTip(): void {
    this.persistenceProvider.getHomeTipAccepted().then((value: string) => {
      this.homeTip = value == 'accepted' ? false : true;
    });
  }

  public hideHomeTip(): void {
    this.persistenceProvider.setHomeTipAccepted('accepted');
    this.homeTip = false;
  }

  private checkFeedbackInfo() {
    this.persistenceProvider.getFeedbackInfo().then(info => {
      if (!info) {
        this.initFeedBackInfo();
      } else {
        let feedbackInfo = info;
        // Check if current version is greater than saved version
        let currentVersion = this.releaseProvider.getCurrentAppVersion();
        let savedVersion = feedbackInfo.version;
        let isVersionUpdated = this.feedbackProvider.isVersionUpdated(
          currentVersion,
          savedVersion
        );
        if (!isVersionUpdated) {
          this.initFeedBackInfo();
          return;
        }
        let now = moment().unix();
        let timeExceeded = now - feedbackInfo.time >= 24 * 7 * 60 * 60;
        this.showRateCard = timeExceeded && !feedbackInfo.sent;
        this.showCard.setShowRateCard(this.showRateCard);
      }
    });
  }

  private initFeedBackInfo() {
    this.persistenceProvider.setFeedbackInfo({
      time: moment().unix(),
      version: this.releaseProvider.getCurrentAppVersion(),
      sent: false
    });
    this.showRateCard = false;
  }

  private updateWallet(walletId: string): void {
    if (this.updatingWalletId[walletId]) return;
    this.startUpdatingWalletId(walletId);
    let wallet = this.profileProvider.getWallet(walletId);
    this.walletProvider
      .getStatus(wallet, {})
      .then(status => {
        wallet.status = status;
        wallet.error = null;
        this.profileProvider.setLastKnownBalance(
          wallet.id,
          wallet.status.availableBalanceStr
        );
        this.updateTxps();
        this.stopUpdatingWalletId(walletId);
      })
      .catch(err => {
        this.logger.error(err);
        this.stopUpdatingWalletId(walletId);
      });
  }

  private updateTxps = _.debounce(
    () => {
      this.profileProvider
        .getTxps({ limit: 3 })
        .then(data => {
          this.zone.run(() => {
            this.txps = data.txps;
            this.txpsN = data.n;
          });
        })
        .catch(err => {
          this.logger.error(err);
        });
    },
    5000,
    {
      leading: true
    }
  );

  private getNotifications = _.debounce(
    () => {
      if (!this.recentTransactionsEnabled) return;
      this.profileProvider
        .getNotifications({ limit: 3 })
        .then(data => {
          this.zone.run(() => {
            this.notifications = data.notifications;
            this.notificationsN = data.total;
          });
        })
        .catch(err => {
          this.logger.error(err);
        });
    },
    5000,
    {
      leading: true
    }
  );

  private updateAllWallets(): void {
    let foundMessage = false;

    if (_.isEmpty(this.wallets)) return;

    let i = this.wallets.length;
    let j = 0;

    let pr = ((wallet, cb) => {
      this.walletProvider
        .getStatus(wallet, {})
        .then(status => {
          wallet.status = status;
          wallet.error = null;

          if (!foundMessage && !_.isEmpty(status.serverMessage)) {
            this.serverMessage = status.serverMessage;
            foundMessage = true;
          }

          this.profileProvider.setLastKnownBalance(
            wallet.id,
            wallet.status.availableBalanceStr
          );
          return cb();
        })
        .catch(err => {
          wallet.error =
            err === 'WALLET_NOT_REGISTERED'
              ? 'Wallet not registered'
              : this.bwcErrorProvider.msg(err);
          this.logger.warn(
            this.bwcErrorProvider.msg(
              err,
              'Error updating status for ' + wallet.name
            )
          );
          return cb();
        });
    }).bind(this);

    _.each(this.wallets, wallet => {
      pr(wallet, () => {
        if (++j == i) {
          this.updateTxps();
        }
      });
    });
  }

  private checkUpdate(): void {
    this.releaseProvider
      .getLatestAppVersion()
      .toPromise()
      .then(version => {
        this.logger.debug('Current app version:', version);
        var result = this.releaseProvider.checkForUpdates(version);
        this.logger.debug('Update available:', result.updateAvailable);
        if (result.updateAvailable) {
          this.newRelease = true;
          this.updateText = this.replaceParametersProvider.replace(
            this.translate.instant(
              'There is a new version of {{nameCase}} available'
            ),
            { nameCase: this.appProvider.info.nameCase }
          );
        }
      })
      .catch(err => {
        this.logger.error('Error getLatestAppVersion', err);
      });
  }

  public openServerMessageLink(): void {
    let url = this.serverMessage.link;
    this.externalLinkProvider.open(url);
  }

  public goToAddView(): void {
    this.navCtrl.push(AddPage);
  }

  public goToWalletDetails(wallet): void {
    if (this.showReorderBtc || this.showReorderBch) return;
    if (!wallet.isComplete()) {
      this.navCtrl.push(CopayersPage, {
        walletId: wallet.credentials.walletId
      });
      return;
    }
    this.navCtrl.push(WalletDetailsPage, {
      walletId: wallet.credentials.walletId
    });
  }

  public goToLocationDetails(loc_id, data): void {
    if (data == null || this.localJson == null || (!data || !this.localJson)) {
      return this.showATMLocationsError();
    }
    this.navCtrl.push(AtmLocationsPage, {
      locationId: loc_id,
      dataSet: data,
      // title: data.title,
      // name: data.name,
      // lat: data.lat,
      // lng: data.lng,
      // zipcode: data.zipcode,
      // street: data.street,
      // city: data.city,
      // state: data.state,
      // country: data.country,
      // hours: data.hours,
      // img: data.img,
      serverJson: this.locations,
      localJson: this.localJson,
      geolocation: this.myLocation
    });
    console.log(data);
  }
  public showATMLocationsError(): void {
    const alert = this.alertCtrl.create({
      title: 'Some connection errors Occured',
      subTitle: 'Sorry, please come back later and refresh the app!',
      buttons: ['OK']
    });
    alert.present();
  }

  public openNotificationModal(n) {
    let wallet = this.profileProvider.getWallet(n.walletId);

    if (n.txid) {
      this.navCtrl.push(TxDetailsPage, { walletId: n.walletId, txid: n.txid });
    } else {
      var txp = _.find(this.txps, {
        id: n.txpId
      });
      if (txp) {
        this.openTxpModal(txp);
      } else {
        this.onGoingProcessProvider.set('loadingTxInfo');
        this.walletProvider
          .getTxp(wallet, n.txpId)
          .then(txp => {
            var _txp = txp;
            this.onGoingProcessProvider.clear();
            this.openTxpModal(_txp);
          })
          .catch(() => {
            this.onGoingProcessProvider.clear();
            this.logger.warn('No txp found');
            let title = this.translate.instant('Error');
            let subtitle = this.translate.instant('Transaction not found');
            return this.popupProvider.ionicAlert(title, subtitle);
          });
      }
    }
  }

  public reorderBtc(): void {
    this.showReorderBtc = !this.showReorderBtc;
  }

  public reorderBch(): void {
    this.showReorderBch = !this.showReorderBch;
  }

  public reorderWalletsBtc(indexes): void {
    let element = this.walletsBtc[indexes.from];
    this.walletsBtc.splice(indexes.from, 1);
    this.walletsBtc.splice(indexes.to, 0, element);
    _.each(this.walletsBtc, (wallet, index: number) => {
      this.profileProvider.setWalletOrder(wallet.id, index);
    });
  }

  public reorderWalletsBch(indexes): void {
    let element = this.walletsBch[indexes.from];
    this.walletsBch.splice(indexes.from, 1);
    this.walletsBch.splice(indexes.to, 0, element);
    _.each(this.walletsBch, (wallet, index: number) => {
      this.profileProvider.setWalletOrder(wallet.id, index);
    });
  }

  public goToDownload(): void {
    let url = 'https://github.com/getcoinscom/gcwallet/releases/latest';
    let optIn = true;
    let title = this.translate.instant('Update Available');
    let message = this.translate.instant(
      'An update to this app is available. For your security, please update to the latest version.'
    );
    let okText = this.translate.instant('View Update');
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

  public openTxpModal(tx): void {
    let modal = this.modalCtrl.create(
      TxpDetailsPage,
      { tx },
      { showBackdrop: false, enableBackdropDismiss: false }
    );
    modal.present();
  }

  public openProposalsPage(): void {
    this.navCtrl.push(ProposalsPage);
  }

  public openActivityPage(): void {
    this.navCtrl.push(ActivityPage);
  }

  public goTo(page): void {
    const pageMap = {
      AmazonPage,
      BitPayCardIntroPage,
      CoinbasePage,
      GlideraPage,
      MercadoLibrePage,
      ShapeshiftPage
    };
    this.navCtrl.push(pageMap[page]);
  }

  public goToCard(cardId): void {
    this.navCtrl.push(BitPayCardPage, { id: cardId });
  }

  public doRefresh(refresher) {
    refresher.pullMin = 90;
    this.updateAllWallets();
    this.getNotifications();
    setTimeout(() => {
      refresher.complete();
    }, 2000);
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
  public openGCSiteLink(): void {
    let url = 'https://www.getcoins.com';
    let optIn = true;
    let title = null;
    let message = this.translate.instant(
      'Go visit our site at www.getcoins.com'
    );
    let okText = this.translate.instant('Open');
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
