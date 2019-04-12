const consts = require('./consts.js')
const Block = require('./block.js')
const Transaction = require('./transaction.js/index.js')
const Fs = require('fs')

const InitialBlocksKey = "blocks"

class Blockchain {

    constructor() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 5;
        this.currentBlock;
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

    addTransaction(transaction) {
        this.currentBlock.append(transaction)
        if (consts.TRANSACTIONS_IN_BLOCK === this.currentBlock.size()) {
            this.currentBlock.calculateHash();
            this.addBlock(this.currentBlock);
            this.currentBlock = new Block();
        }
    }

    findHash(transactionHash) {
        chain.forEach(block => {
            if (block.bloomFilter.exists(transactionHash)) {
                const root = tree.getRoot().toString('hex')
                return block.merkle.verify(block.merkle.getProof(transactionHash), transactionHash, root);
            }
        });

        throw "Transaction not found, hash: " + transactionHash;
    }

    addBlock(newBlock) {
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
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