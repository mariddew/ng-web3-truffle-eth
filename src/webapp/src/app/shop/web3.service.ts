import {Injectable} from '@angular/core';

import Rx from 'rxjs/Rx';
import {Observable} from 'rxjs/Observable';

import {default as Web3} from 'web3';
import {default as contract} from 'truffle-contract';
import metacoin_artifacts from '../../../../truffle/build/contracts/MetaCoin.json';

@Injectable()
export class Web3Service {
  public web3: any;
  public accounts: any;

  private metaCoin: any = contract(metacoin_artifacts);

  constructor() {
    this.setProvider();
  }

  public getAccounts(): Observable<any> {
    return Rx.Observable.create((observer) => {
      // Get the initial account balance so it can be displayed.
      this.web3.eth.getAccounts((err, accs) => {
        if (err != null) {
          observer.error(err);
          return;
        }
        if (accs.length == 0) {
          alert('Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.');
          return;
        }
        observer.next(accs);
        observer.complete();
      });
    });
  }

  public getAccountBalance(account: any): Observable<any> {
    return Observable.fromPromise(this.metaCoin.deployed().then((instance) => {
      return instance.getBalance.call(account, {from: account});
    }));
  }

  public getBlock(blockNumber) {
    return Observable.create((observer) => {
      this.web3.eth.getBlock(blockNumber, true, function (err, block) {
        if (err) observer.error(err);
        observer.next(block);
        observer.complete();
      })
    })
  }

  public sendCoin(sendAddr, receiveAddr, amount) {
    return Observable.fromPromise(this.metaCoin.deployed().then((instance) => {
      return instance.sendCoin(receiveAddr, amount, {from: sendAddr});
    }));
  }

  private setProvider() {
    this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
    this.metaCoin.setProvider(this.web3.currentProvider);
  }

}
