const {
    Blockchain,
    Block
} = require('./blockchain.js')

let ronfCoin = new Blockchain();
ronfCoin.addBlock(new Block(1, "20/01/2019", {
    amount: 4
}));
ronfCoin.addBlock(new Block(2, "20/02/2019", {
    amount: 8
}));

console.log('Blockchain valid? ' + ronfCoin.isChainValid());
console.log(JSON.stringify(ronfCoin, null, 4));

/*
ronfCoin.chain[1].data = {
    amount: 100
}
console.log('Blockchain valid? ' + ronfCoin.isChainValid());
*/
console.log('Mining block 1...');
ronfCoin.addBlock(new Block(1, "20/07/2017", {
    amount: 4
}));
console.log('Mining block 2...');
ronfCoin.addBlock(new Block(2, "20/07/2017", {
    amount: 8
}));