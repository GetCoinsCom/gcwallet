import { Component, ViewChild } from '@angular/core';
import {
  Events,
  ModalController,
  NavController,
  NavParams
} from 'ionic-angular';
import * as _ from 'lodash';
import { Logger } from '../../../../providers/logger/logger';

// pages
import { FinishModalPage } from '../../../finish/finish';
import { GlideraPage } from '../../../integrations/glidera/glidera';

// providers
import { ConfigProvider } from '../../../../providers/config/config';
import { GlideraProvider } from '../../../../providers/glidera/glidera';
import { OnGoingProcessProvider } from '../../../../providers/on-going-process/on-going-process';
import { PlatformProvider } from '../../../../providers/platform/platform';
import { PopupProvider } from '../../../../providers/popup/popup';
import { ProfileProvider } from '../../../../providers/profile/profile';
import { TxFormatProvider } from '../../../../providers/tx-format/tx-format';
import { WalletProvider } from '../../../../providers/wallet/wallet';
import { setPrice } from '../../integrations';

@Component({
  selector: 'page-sell-glidera',
  templateUrl: 'sell-glidera.html'
})
export class SellGlideraPage {
  @ViewChild('slideButton')
  slideButton;

  public isCordova: boolean;
  public token: string;
  public isFiat: boolean;
  public network: string;
  public wallet;
  public wallets;
  public amountUnitStr: string;
  public sellInfo;
  public isOpenSelector: boolean;

  private currency: string;
  private amount: number;
  private coin: string;

  constructor(
    private platformProvider: PlatformProvider,
    private logger: Logger,
    private popupProvider: PopupProvider,
    private navCtrl: NavController,
    private navParams: NavParams,
    private onGoingProcessProvider: OnGoingProcessProvider,
    private glideraProvider: GlideraProvider,
    private profileProvider: ProfileProvider,
    private txFormatProvider: TxFormatProvider,
    private walletProvider: WalletProvider,
    private configProvider: ConfigProvider,
    private events: Events,
    private modalCtrl: ModalController
  ) {
    this.coin = 'btc';
    this.isCordova = this.platformProvider.isCordova;
  }

  ionViewWillLeave() {
    this.navCtrl.swipeBackEnabled = true;
  }

  ionViewWillEnter() {
    this.isOpenSelector = false;
    this.navCtrl.swipeBackEnabled = false;

    this.isFiat = this.navParams.data.currency != 'BTC' ? true : false;
    this.amount = this.navParams.data.amount;
    this.currency = this.navParams.data.currency;

    this.network = this.glideraProvider.getNetwork();
    this.wallets = this.profileProvider.getWallets({
      m: 1, // Only 1-signature wallet
      onlyComplete: true,
      network: this.network,
      hasFunds: true,
      coin: this.coin
    });

    if (_.isEmpty(this.wallets)) {
      this.showErrorAndBack('No wallets available');
      return;
    }
    this.onWalletSelect(this.wallets[0]); // Default first wallet
  }

  private showErrorAndBack(err): void {
    if (this.isCordova) this.slideButton.isConfirmed(false);
    this.logger.error(err);
    err = err.errors ? err.errors[0].message : err;
    this.popupProvider.ionicAlert('Error', err).then(() => {
      this.navCtrl.pop();
    });
  }

  private showError(err): void {
    if (this.isCordova) this.slideButton.isConfirmed(false);
    this.logger.error(err);
    err = err.errors ? err.errors[0].message : err;
    this.popupProvider.ionicAlert('Error', err);
  }

  private processPaymentInfo(): void {
    this.onGoingProcessProvider.set('connectingGlidera');
    this.glideraProvider.init((err, data) => {
      if (err) {
        this.onGoingProcessProvider.clear();
        this.showErrorAndBack(err);
        return;
      }
      this.token = data.token;
      let price = setPrice(this.isFiat, this.amount);
      this.glideraProvider.sellPrice(this.token, price, (err, sell) => {
        this.onGoingProcessProvider.clear();
        if (err) {
          this.showErrorAndBack(err);
          return;
        }
        this.sellInfo = sell;
      });
    });
  }

  private ask2FaCode(mode, cb): () => any {
    if (mode != 'NONE') {
      // SHOW PROMPT
      let title = 'Please, enter the code below';
      let message;
      if (mode == 'PIN') {
        message = 'You have enabled PIN based two-factor authentication.';
      } else if (mode == 'AUTHENTICATOR') {
        message = 'Use an authenticator app (Authy or Google Authenticator).';
      } else {
        message =
          'A SMS containing a confirmation code was sent to your phone.';
      }
      this.popupProvider.ionicPrompt(title, message).then(twoFaCode => {
        if (typeof twoFaCode == 'undefined') return cb();
        return cb(twoFaCode);
      });
    } else {
      return cb();
    }
    return undefined;
  }

  public sellConfirm(): void {
    let message = 'Sell bitcoin for ' + this.amount + ' ' + this.currency;
    let okText = 'Confirm';
    let cancelText = 'Cancel';
    this.popupProvider
      .ionicConfirm(null, message, okText, cancelText)
      .then(ok => {
        if (!ok) {
          if (this.isCordova) this.slideButton.isConfirmed(false);
          return;
        }
        this.onGoingProcessProvider.set('sellingBitcoin');
        this.glideraProvider.get2faCode(this.token, (err, tfa) => {
          if (err) {
            this.onGoingProcessProvider.clear();
            this.showError(err);
            return;
          }
          this.ask2FaCode(tfa.mode, twoFaCode => {
            if (tfa.mode != 'NONE' && _.isEmpty(twoFaCode)) {
              this.onGoingProcessProvider.clear();
              this.showError('No code entered');
              return;
            }

            let outputs = [];
            let config = this.configProvider.get();
            let configWallet = config.wallet;
            let walletSettings = configWallet.settings;

            this.walletProvider
              .getAddress(this.wallet, false)
              .then(refundAddress => {
                if (!refundAddress) {
                  this.onGoingProcessProvider.clear();
                  this.showError('Could not create address');
                  return;
                }
                this.glideraProvider.getSellAddress(
                  this.token,
                  (err, sellAddress) => {
                    if (!sellAddress || err) {
                      this.onGoingProcessProvider.clear();
                      this.showError(err);
                      return;
                    }
                    let amount = parseInt(
                      (this.sellInfo.qty * 100000000).toFixed(0),
                      10
                    );
                    let comment = 'Glidera transaction';

                    outputs.push({
                      toAddress: sellAddress,
                      amount,
                      message: comment
                    });

                    let txp = {
                      toAddress: sellAddress,
                      amount,
                      outputs,
                      message: comment,
                      payProUrl: null,
                      excludeUnconfirmedUtxos: configWallet.spendUnconfirmed
                        ? false
                        : true,
                      feeLevel: walletSettings.feeLevel || 'normal',
                      customData: {
                        glideraToken: this.token
                      }
                    };

                    this.walletProvider
                      .createTx(this.wallet, txp)
                      .then(createdTxp => {
                        this.walletProvider
                          .prepare(this.wallet)
                          .then(password => {
                            this.walletProvider
                              .publishTx(this.wallet, createdTxp)
                              .then(publishedTxp => {
                                this.walletProvider
                                  .signTx(this.wallet, publishedTxp, password)
                                  .then(signedTxp => {
                                    let rawTx = signedTxp.raw;
                                    let data = {
                                      refundAddress,
                                      signedTransaction: rawTx,
                                      priceUuid: this.sellInfo.priceUuid,
                                      useCurrentPrice: this.sellInfo.priceUuid
                                        ? false
                                        : true,
                                      ip: null
                                    };
                                    this.glideraProvider.sell(
                                      this.token,
                                      twoFaCode,
                                      data,
                                      (err, data) => {
                                        this.onGoingProcessProvider.clear();
                                        if (err) return this.showError(err);
                                        this.logger.info(
                                          'Glidera Sell Info: ',
                                          JSON.stringify(data)
                                        );
                                        this.openFinishModal();
                                      }
                                    );
                                  })
                                  .catch(err => {
                                    this.onGoingProcessProvider.clear();
                                    this.showError(err);
                                    this.walletProvider
                                      .removeTx(this.wallet, publishedTxp)
                                      .catch(err => {
                                        // TODO in the original code use signedTxp on this function
                                        if (err) this.logger.debug(err);
                                      });
                                  });
                              })
                              .catch(err => {
                                this.onGoingProcessProvider.clear();
                                this.showError(err);
                              });
                          })
                          .catch(err => {
                            this.onGoingProcessProvider.clear();
                            this.showError(err);
                          });
                      })
                      .catch(err => {
                        this.onGoingProcessProvider.clear();
                        this.showError(err);
                      });
                  }
                );
              });
          });
        });
      });
  }

  public onWalletSelect(wallet): void {
    this.wallet = wallet;
    let parsedAmount = this.txFormatProvider.parseAmount(
      this.coin,
      this.amount,
      this.currency
    );

    this.amount = parsedAmount.amount;
    this.currency = parsedAmount.currency;
    this.amountUnitStr = parsedAmount.amountUnitStr;
    this.processPaymentInfo();
  }

  public showWallets(): void {
    this.isOpenSelector = true;
    let id = this.wallet ? this.wallet.credentials.walletId : null;
    this.events.publish(
      'showWalletsSelectorEvent',
      this.wallets,
      id,
      'Sell From'
    );
    this.events.subscribe('selectWalletEvent', wallet => {
      if (!_.isEmpty(wallet)) this.onWalletSelect(wallet);
      this.events.unsubscribe('selectWalletEvent');
      this.isOpenSelector = false;
    });
  }

  private openFinishModal(): void {
    let finishText = 'Funds sent to Glidera Account';
    let finishComment =
      'The transaction is not yet confirmed, and will show as "Pending" in your Activity. The bitcoin sale will be completed automatically once it is confirmed by Glidera';
    let modal = this.modalCtrl.create(
      FinishModalPage,
      { finishText, finishComment },
      { showBackdrop: true, enableBackdropDismiss: false }
    );
    modal.present();
    modal.onDidDismiss(async () => {
      await this.navCtrl.popToRoot({ animate: false });
      await this.navCtrl.parent.select(0);
      await this.navCtrl.push(GlideraPage, null, { animate: false });
    });
  }
}
