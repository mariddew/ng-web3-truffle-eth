import {Component, OnInit} from '@angular/core';

import {Web3Service} from './web3.service';

import {EthAccountModel} from './eth-account.interface';

import {PRODUCTS} from './products';

import $ from 'jquery';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'home',
  providers: [Web3Service],
  styleUrls: ['./shop.component.css'],
  templateUrl: './shop.component.html'
})
export class ShopComponent implements OnInit {
  /** Accounts **/
  public customerAddr: EthAccountModel = new EthAccountModel;
  public sellerAddr: EthAccountModel = new EthAccountModel;

  /** Product **/
  public products: any = PRODUCTS;
  public shoppingCart: any = [];
  public orderTotal: number = 0;

  /** Block Transactions **/
  public logs = [];

  private isSubscribed: boolean = true;

  constructor(private web3Service: Web3Service) {
  }

  public ngOnInit() {
  }

  public ngAfterViewInit() {
    this.hideBusy();
    this.setStickeyNavbar();
    this.refreshAccountBalance();
    this.refreshLogs();
  }

  public ngOnDestroy() {
    this.isSubscribed = false;
  }

  public addToCart(product: any) {
    this.shoppingCart.push(product);
    this.orderTotal += product.price;
  }

  public removeFromCart(cartIdx: number) {
    this.orderTotal -= this.shoppingCart[cartIdx].price;
    this.shoppingCart.splice(cartIdx, 1);
  }

  public checkout(): void {
    if (this.orderTotal > 0) {
      this.showBusy();
      this.web3Service.sendCoin(
        this.customerAddr.address,
        this.sellerAddr.address,
        this.orderTotal)
        .subscribe(
          () => {
            this.refreshAccountBalance();
            this.refreshLogs();
            this.shoppingCart = [];
            this.orderTotal = 0;
            this.hideBusy();
            this.scrollTo('#wallet-section');
          },
          (err) => {
            this.hideBusy();
            alert(err);
          }
        )
    }
  }

  public scrollTo(sectionId: string): void {
    $('html, body').animate({
      scrollTop: $(sectionId).offset().top
    });
  }

  private refreshAccountBalance() {
    this.web3Service.getAccounts()
      .flatMap((accounts) => {
        this.customerAddr.address = accounts[0];
        this.sellerAddr.address = accounts[1];
        return this.web3Service.getAccountBalance(this.customerAddr.address);
      })
      .flatMap((customerBalance) => {
        this.customerAddr.balance = customerBalance.valueOf();
        return this.web3Service.getAccountBalance(this.sellerAddr.address);
      })
      .takeWhile(() => {
        return this.isSubscribed
      })
      .subscribe(
        (sellerBalance) => {
          this.sellerAddr.balance = sellerBalance;


          this.web3Service.web3.eth.filter({
            fromBlock: 0,
            toBlock: 'latest'
          }).get((error, logs) => {
            console.log('get logs', logs);
          });

        },
        (err) => {
          alert(err);
        }
      );
  }

  private refreshLogs() {
    this.web3Service.web3.eth.filter({
      fromBlock: 0,
      toBlock: 'latest'
    }).get((error, logs) => {
      Object.assign(this.logs, logs);
    });
  }

  private hideBusy(): void {
    $('.loader').removeClass('is-busy').fadeOut();
    $('.loader-mask').delay(350).fadeOut('slow');
  }

  private showBusy(): void {
    $('.loader-mask').addClass('is-busy').fadeIn('fast');
    $('.loader').fadeIn();
  }


  private setStickeyNavbar(): void {
    Observable.fromEvent($(window), 'scroll')
      .takeWhile(() => {
        return this.isSubscribed
      })
      .subscribe(
        () => {
          if ($(window).scrollTop() > 50) {
            $('#sticky-nav').addClass('sticky offset scrolling');
          } else {
            $('#sticky-nav').removeClass('sticky offset scrolling');
          }
        }
      );
  }
}
