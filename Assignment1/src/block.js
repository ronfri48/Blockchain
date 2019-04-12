const SHA256 = require("crypto-js/sha256");
const MerkleTree = require('merkletreejs')
const BloomFilter = require('./bloomfilter.js')


class Block {
    constructor(timestamp, transactions, previousHash = '') {
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.hash = this.calculateHash();
        this.nonce = 0;
        this.merkle = null;
        this.bloomFilter = new BloomFilter(4);
    }

    append(transaction) {
        this.transactions.push(transaction);
        self.bloomFilter.add(this.merkleHashFunc(transaction));
    }

    merkleHashFunc(transaction) {
        return SHA256(this.previousHash + this.timestamp + JSON.stringify(transaction) + this.nonce).toString();
    }

    calculateHash() {
        this.generateMerkle();
        return this.merkle.getRoot().toString('hex');
    }

    generateMerkle() {
        const leaves = self.transaction.map(transaction => merkleHashFunc(transaction));
        self.merkle = new MerkleTree(leaves, merkleHashFunc)
    }

    size() {
        return self.transactions.length;
    }

    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log("BLOCK MINED: " + this.hash + " " + this.nonce)
    }
}

module.exports.Block = Block;