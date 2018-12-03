import { Component, Injectable } from '@angular/core';
import * as toudoc from '../../../../assets/terms-and-conditions.json';

// providers
import { Logger } from '../../../../providers/logger/logger';

// import * as _ from 'lodash';

@Component({
  selector: 'page-terms-and-conditions',
  templateUrl: 'terms-and-conditions.html'
})
@Injectable()
export class TermsAndConditionsPage {
  public data: object;
  public toudoc: object;

  public touTitle = toudoc['title'];
  public touUpdate = toudoc['update'];
  public touComFull = toudoc['company_full'];
  public touCom = toudoc['company'];
  public touBwsFull = toudoc['bws_full'];
  public touBws = toudoc['bws'];
  public touSubComFull = toudoc['subcompany_full'];
  public touSubCom = toudoc['subcompany'];
  public touPartiesStm = toudoc['parties_stm'];
  public touRightsObligation = toudoc['rights_obligation'];
  public touDisclaimer = toudoc['disclaimer'];
  public touChoiceOfLaw = toudoc['choice_of_low'];
  public touSeverability = toudoc['severability'];
  public touBindingArg = toudoc['binding_agreement'];
  public touState = toudoc['state'];

  // constructor(private toudata: TermsOfUseDataProvider, private logger: Logger, private translate: TranslateService
  constructor(private logger: Logger) {
    this.logger.info('ionViewDIdLoad TermsAndConditionsPage.');
    // console.log(toudoc);
    // console.log(this.touTitle);
  }
  /*
    ngOnInit() {
      this.logger.info('This is before subscribing the json data');
      this.toudata.getTOU().subscribe(
        toudata => this.data = toudata
      );
    }*/
  /*
public test() {
  // this.logger.info('This is inside test func.');
}
*/
  // public jsonfileURL: string = '';
  // public getTermsOfUse() {
  //   let jsonTOU: string = '';
  // }
  /* public get(addr: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.persistenceProvider
        .getAddressBook('testnet')
        .then(ab => {
          if (ab && _.isString(ab)) ab = JSON.parse(ab);
          if (ab && ab[addr]) return resolve(ab[addr]);

          this.persistenceProvider
            .getAddressBook('livenet')
            .then(ab => {
              if (ab && _.isString(ab)) ab = JSON.parse(ab);
              if (ab && ab[addr]) return resolve(ab[addr]);
              return resolve();
            })
            .catch(() => {
              return reject();
            });
        })
        .catch(() => {
          return reject();
        });
    });
  }

  public list(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.persistenceProvider
        .getAddressBook('testnet')
        .then(ab => {
          if (ab && _.isString(ab)) ab = JSON.parse(ab);

          ab = ab || {};
          this.persistenceProvider
            .getAddressBook('livenet')
            .then(ab2 => {
              if (ab2 && _.isString(ab)) ab2 = JSON.parse(ab2);

              ab2 = ab2 || {};
              return resolve(_.defaults(ab2, ab));
            })
            .catch(err => {
              return reject(err);
            });
        })
        .catch(() => {
          let msg = this.translate.instant('Could not get the Addressbook');
          return reject(msg);
        });
    });
  }

  public add(entry): Promise<any> {
    return new Promise((resolve, reject) => {
      var network = this.getNetwork(entry.address);
      if (_.isEmpty(network)) {
        let msg = this.translate.instant('Not valid bitcoin address');
        return reject(msg);
      }
      this.persistenceProvider
        .getAddressBook(network)
        .then(ab => {
          if (ab && _.isString(ab)) ab = JSON.parse(ab);
          ab = ab || {};
          if (_.isArray(ab)) ab = {}; // No array
          if (ab[entry.address]) {
            let msg = this.translate.instant('Entry already exist');
            return reject(msg);
          }
          ab[entry.address] = entry;
          this.persistenceProvider
            .setAddressBook(network, JSON.stringify(ab))
            .then(() => {
              this.list()
                .then(ab => {
                  return resolve(ab);
                })
                .catch(err => {
                  return reject(err);
                });
            })
            .catch(() => {
              let msg = this.translate.instant('Error adding new entry');
              return reject(msg);
            });
        })
        .catch(err => {
          return reject(err);
        });
    });
  }

  public remove(addr): Promise<any> {
    return new Promise((resolve, reject) => {
      var network = this.getNetwork(addr);
      if (_.isEmpty(network)) {
        let msg = this.translate.instant('Not valid bitcoin address');
        return reject(msg);
      }
      this.persistenceProvider
        .getAddressBook(network)
        .then(ab => {
          if (ab && _.isString(ab)) ab = JSON.parse(ab);
          ab = ab || {};
          if (_.isEmpty(ab)) {
            let msg = this.translate.instant('Addressbook is empty');
            return reject(msg);
          }
          if (!ab[addr]) {
            let msg = this.translate.instant('Entry does not exist');
            return reject(msg);
          }
          delete ab[addr];
          this.persistenceProvider
            .setAddressBook(network, JSON.stringify(ab))
            .then(() => {
              this.list()
                .then(ab => {
                  return resolve(ab);
                })
                .catch(err => {
                  return reject(err);
                });
            })
            .catch(() => {
              let msg = this.translate.instant('Error deleting entry');
              return reject(msg);
            });
        })
        .catch(err => {
          return reject(err);
        });
    });
  }

  public removeAll(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.persistenceProvider
        .removeAddressbook('livenet')
        .then(() => {
          this.persistenceProvider.removeAddressbook('testnet').then(() => {
            return resolve();
          });
        })
        .catch(() => {
          let msg = this.translate.instant('Error deleting addressbook');
          return reject(msg);
        })
        .catch(() => {
          let msg = this.translate.instant('Error deleting addressbook');
          return reject(msg);
        });
    });
  } */
}
