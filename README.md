
# Getcoins-wallet

The GetCoins Wallet is a fork of the Copay Wallet (https://github.com/getcoinscom/gcwallet).

The GetCoins Wallet is a secure bitcoin wallet platform for both desktop and mobile devices. It uses BitPay Bitcore Wallet Service (BWS) for peer synchronization and network interfacing.

Binary versions of the GetCoins Wallet are available for download at Getcoins.com.

For a list of frequently asked questions please visit the GetCoins Wallet FAQ.

## Main Features

- Multiple wallet creation and management in-app
- Intuitive, multisignature security for personal or shared wallets
- Easy spending proposal flow for shared wallets and group payments
- [BIP32](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki) Hierarchical deterministic (HD) address generation and wallet backups
- Device-based security: all private keys are stored locally, not in the cloud
- Support for Bitcoin testnet wallets
- Synchronous access across all major mobile and desktop platforms
- Payment protocol (BIP70-BIP73) support: easily-identifiable payment requests and verifiable, secure bitcoin payments
- Support for over 150 currency pricing options and unit denomination in BTC or bits
- Mnemonic (BIP39) support for wallet backups
- Paper wallet sweep support (BIP38)
- Email notifications for payments and transfers
- Push notifications (only available for ios and android versions)
- Customizable wallet naming and background colors
- Multiple languages supported
- Available for [iOS](https://itunes.apple.com/us/app/gcwallet/id), [Linux](https://github.com/getcoinscom/gcwallet/releases/latest), [Windows](https://github.com/getcoinscom/gcwallet/releases/latest) and [OS X](https://github.com/getcoinscom/gcwallet/releases/latest) devices

## Testing in a Browser

> **Note:** This method should only be used for development purposes. When running GetCoins in a normal browser environment, browser extensions and other malicious code might have access to internal data and private keys. For production use, see the latest official [releases](https://github.com/getcoinscom/gcwallet/releases/).

Clone the repo and open the directory:

```sh
git clone https://github.com/getcoinscom/gcwallet.git
cd getcoins
```

Ensure you have [Node](https://nodejs.org/) installed, then install and start GetCoins:

```sh
npm install
npm run apply:getcoins
npm run start
```

Visit [`localhost:8100`](http://localhost:8100/) to view the app.

## Unit & E2E Tests (Karma & Protractor)

To run the tests, run:

```
 npm run test
```

## Testing on Real Devices

It's recommended that all final testing be done on a real device – both to assess performance and to enable features that are unavailable to the emulator (e.g. a device camera).

### Android

Follow the [Cordova Android Platform Guide](https://cordova.apache.org/docs/en/latest/guide/platforms/android/) to set up your development environment.

When your developement enviroment is ready, run the `start:android` package script.

```sh
npm run apply:getcoins
npm run prepare:getcoins
npm run start:android
```

### iOS

Follow the [Cordova iOS Platform Guide](https://cordova.apache.org/docs/en/latest/guide/platforms/ios/) to set up your development environment.

When your developement enviroment is ready, run the `start:ios` package script.

```sh
npm run apply:getcoins
npm run prepare:getcoins
npm run start:ios
```

### Desktop (Linux, macOS, and Windows)

The desktop version of GetCoins currently uses NW.js, an app runtime based on Chromium. To get started, first install NW.js on your system from [the NW.js website](https://nwjs.io/).

When NW.js is installed, run the `start:desktop` package script.

```sh
npm run apply:getcoins
npm run start:desktop
``` 

## Build GetCoinsWallet App Bundles

Before building the release version for a platform, run the `clean-all` command to delete any untracked files in your current working directory. (Be sure to stash any uncommited changes you've made.) This guarantees consistency across builds for the current state of this repository.

The `final` commands build the production version of the app, and bundle it with the release version of the platform being built.

### Android

```sh
npm run clean-all
npm run apply:getcoins
npm run prepare:getcoins
npm run final:android
```

### iOS

```sh
npm run clean-all
npm run apply:getcoins
npm run prepare:getcoins
npm run final:ios
```

### Desktop (Linux, macOS, and Windows)

```sh
npm run clean-all
npm run apply:getcoins
npm run final:desktop
```

## Configuration

### Enable External Services

To enable external services, set the `GETCOINS_EXTERNAL_SERVICES_CONFIG_LOCATION` environment variable to the location of your configuration before running the `apply` task.

```sh
GETCOINS_EXTERNAL_SERVICES_CONFIG_LOCATION="~/.getcoins/externalServices.json" npm run apply:getcoins
```

## About GetCoins

### General

GetCoins Wallet implements a multisig wallet using [p2sh](https://en.bitcoin.it/wiki/Pay_to_script_hash) addresses. It supports multiple wallets, each with its own configuration, such as 3-of-5 (3 required signatures from 5 participant peers) or 2-of-3. To create a multisig wallet shared between multiple participants, GetCoins requires the extended public keys of all the wallet participants. Those public keys are then incorporated into the wallet configuration and combined to generate a payment address where funds can be sent into the wallet. Conversely, each participant manages their own private key and that private key is never transmitted anywhere.

To unlock a payment and spend the wallet's funds, a quorum of participant signatures must be collected and assembled in the transaction. The funds cannot be spent without at least the minimum number of signatures required by the wallet configuration (2-of-3, 3-of-5, 6-of-6, etc.). Once a transaction proposal is created, the proposal is distributed among the wallet participants for each to sign the transaction locally. Finally, when the transaction is signed, the last signing participant will broadcast the transaction to the Bitcoin network.

GetCoins also implements [BIP32](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki) to generate new addresses for peers. The public key that each participant contributes to the wallet is a BIP32 extended public key. As additional public keys are needed for wallet operations (to produce new addresses to receive payments into the wallet, for example) new public keys can be derived from the participants' original extended public keys. Once again, it's important to stress that each participant keeps their own private keys locally - private keys are not shared - and are used to sign transaction proposals to make payments from the shared wallet.

For more information regarding how addresses are generated using this procedure, see: [Structure for Deterministic P2SH Multisignature Wallets](https://github.com/bitcoin/bips/blob/master/bip-0045.mediawiki).

## GetCoins Backups and Recovery

GetCoins uses BIP39 mnemonics for backing up wallets. The BIP44 standard is used for wallet address derivation. Multisig wallets use P2SH addresses, while non-multisig wallets use P2PKH.

Information about backup and recovery procedures is available at: https://github.com/getcoinscom/gcwallet/blob/master/backupRecovery.md


## Wallet Export Format

GetCoins encrypts the backup with the [Stanford JS Crypto Library](http://bitwiseshiftleft.github.io/sjcl/). To extract the private key of your wallet you can go to settings, choose your wallet, click in "more options", then "wallet information", scroll to the bottom and click in "Extended Private Key". That information is enough to sign any transaction from your wallet, so be careful when handling it!

The backup also contains the key `publicKeyRing` that holds the extended public keys of the Copayers.
Depending on the key `derivationStrategy`, addresses are derived using
[BIP44](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki) or [BIP45](https://github.com/bitcoin/bips/blob/master/bip-0045.mediawiki). Wallets created in GetCoins v1.2 and forward always use BIP44, all previous wallets use BIP45. Also note that since GetCoins version v1.2, non-multisig wallets use address types Pay-to-PublicKeyHash (P2PKH) while multisig wallets still use Pay-to-ScriptHash (P2SH) (key `addressType` at the backup):

| GetCoins Version | Wallet Type               | Derivation Strategy | Address Type |
| ---------------- | ------------------------- | ------------------- | ------------ |
| 1.0            | Multisig Hardware wallets | BIP44 (root m/48’)  | P2SH         |

Using a tool like [Bitcore PlayGround](http://bitcore.io/playground) all wallet addresses can be generated. (TIP: Use the `Address` section for P2PKH address type wallets and `Multisig Address` for P2SH address type wallets). For multisig addresses, the required number of signatures (key `m` on the export) is also needed to recreate the addresses.

BIP45 note: All addresses generated at BWS with BIP45 use the 'shared cosigner index' (2147483647) so GetCoins address indexes look like: `m/45'/2147483647/0/x` for main addresses and `m/45'/2147483647/1/y` for change addresses.

GetCoins uses the root `m/48'` for hardware multisignature wallets. This was coordinated with Ledger and Trezor teams. While the derivation path format is still similar to BIP44, the root was in order to indicate that these wallets are not discoverable by scanning addresses for funds. Address generation for multisignature wallets requires the other getcoinsers extended public keys.

## Bitcore Wallet Service

GetCoins depends on [Bitcore Wallet Service](https://github.com/bitpay/bitcore-wallet-service) (BWS) for blockchain information, networking and Copayer synchronization. A BWS instance can be setup and operational within minutes or you can use a public instance like `https://bws.bitpay.com`. Switching between BWS instances is very simple and can be done with a click from within GetCoins. BWS also allows GetCoins to interoperate with other wallets like [Bitcore Wallet CLI](https://github.com/bitpay/bitcore-wallet).

## Release Schedules

GetCoins uses the `MAJOR.MINOR.BATCH` convention for versioning. Any release that adds features should modify the MINOR or MAJOR number.

### Bug Fixing Releases

We release bug fixes as soon as possible for all platforms. There is no coordination so all platforms are updated at the same time.

### Minor and Major Releases

- t+0: tag the release 1.2 and "text lock" (meaning only non-text related bug fixes. Though this rule is sometimes broken, it's good to make a rule.)
- t+7: testing for 1.2 is finished, translation is also finished, and 1.2.1 is tagged with all translations along with bug fixes made in the last week.
- t+7: iOS is submitted for 1.2.1. All other platforms are submitted with auto-release off.
- t + (~17): All platforms 1.2.1 are released when Apple approves the iOS application update.

## Contributing to this project

Anyone and everyone is welcome to contribute. Please take a moment to
review the [guidelines for contributing](CONTRIBUTING.md).

- [Bug reports](CONTRIBUTING.md#bugs)
- [Feature requests](CONTRIBUTING.md#features)
- [Pull requests](CONTRIBUTING.md#pull-requests)

## Support

Please see [Support requests](CONTRIBUTING.md#support)

## License

GetCoins is released under the MIT License. Please refer to the [LICENSE](https://github.com/getcoinscom/gcwallet/blob/master/LICENSE) file that accompanies this project for more information including complete terms and conditions.
