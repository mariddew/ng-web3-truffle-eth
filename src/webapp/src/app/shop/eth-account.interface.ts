export class EthAccountModel implements IEthAccount {
  address: string = '';
  balance: number = 0;
}

interface IEthAccount {
  address: string;
  balance: number;
}
