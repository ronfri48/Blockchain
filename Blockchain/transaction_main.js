const {
    Blockchain,
    Transaction
} = require('./transaction_blockchain.js')

let ronfCoin = new Blockchain();
ronfCoin.createTransaction(new Transaction('address1', 'address2', 100));
ronfCoin.createTransaction(new Transaction('address2', 'address1', 50));

console.log('\n Starting the miner...');
ronfCoin.minePendingTransactions('Bob-address');

console.log('\nBalance of Bob is', ronfCoin.getBalanceOfAddress('Bob-address'));

console.log('\n Starting the miner again...');
ronfCoin.minePendingTransactions('Bob-address');

console.log('\nBalance of Bob is', ronfCoin.getBalanceOfAddress('Bob-address'));
console.log(JSON.stringify(ronfCoin, null, 4));