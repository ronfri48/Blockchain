const Block = require('../src/block.js')
const Transaction = require('./transaction.js/index.js')
const Fs = require('fs')

const InitialBlocksKey = "blocks"

class Blockchain {

    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 5;

        this.pendingTransactions = []; // Transacions poll that have to be collected into the block
        this.miningReward = 100;

    }

    loadFromJson(jsonPath) {
        var data = Fs.readFileSync(jsonPath, 'utf8');
        var jsonData = JSON.parse(data);

        jsonData[InitialBlocksKey].forEach(element => {
            this.addBlock(jsonData)
        });
    }

    createGenesisBlock() {
        return new Block("01/01/2019", "Genesis block", "0");
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash;
        //newBlock.hash = newBlock.calculateHash();
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
    }

    minePendingTransactions(miningRewardAddress) {
        // Transacion from nowhere to my address
        const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
        this.pendingTransactions.push(rewardTx);

        let block = new Block(Date.now(), this.pendingTransactions, this.getLatestBlock().hash);
        block.mineBlock(this.difficulty);

        console.log('Block successfully mined!');
        this.chain.push(block);
        this.pendingTransactions = []; //In reality limit block
    }

    createTransaction(transaction) {
        this.pendingTransactions.push(transaction);
    }


    isChainValid() {
        for (let i = 1; i < this.chain.length; i++) {
            const currentBlock = this.chain[i];
            const prevBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHash()) {
                return false;
            }

            if (currentBlock.previousHash !== prevBlock.hash) {
                return false;
            }
        }

        return true;
    }

    getBalanceOfAddress(address) {
        let balance = 0;

        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress === address) {
                    balance -= trans.amount;
                }

                if (trans.toAddress === address) {
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }
}

module.exports.Blockchain = Blockchain;