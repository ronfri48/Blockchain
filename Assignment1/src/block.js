const SHA256 = require("crypto-js/sha256")
const MerkleTree = require('merkletreejs')
const BloomFilter = require('./bloomfilter.js')
const Transaction = require('./transaction.js')


class Block {
    constructor(timestamp, transactions, previousHash = '') {
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.hash = this.calculateHash();
        this.nonce = 0;
        this.bloomFilter = new BloomFilter(4);

        transactions.forEach(transaction => {
            this.bloomFilter.add(this.merkleHashFunc(transaction));
        });
    }

    toJson() {
        var blockJson = "";

        this.transactions.forEach(transaction => {
            if ("" === blockJson) {
                blockJson += "{\"timestamp\": " + this.timestamp + ", \"transactions\": [";
            } else {
                blockJson += ", "
            }

            blockJson += transaction.toJson();
        });

        blockJson += "], \"previousHash\": \"" + this.previousHash + "\"}";

        return blockJson;
    }

    append(transaction) {
        this.transactions.push(transaction);
        this.bloomFilter.add(this.merkleHashFunc(transaction));
    }

    merkleHashFunc(transaction) {
        return SHA256(JSON.stringify(transaction)).toString();
    }

    calculateHash() {
        this.generateMerkle();
        return this.merkle.getRoot().toString('hex');
    }

    generateMerkle() {
        const leaves = this.transactions.map(transaction => this.merkleHashFunc(transaction));
        this.merkle = new MerkleTree.MerkleTree(leaves, this.merkleHashFunc)
    }

    size() {
        return this.transactions.length;
    }

    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log("BLOCK MINED: " + this.hash + " " + this.nonce);
    }
}

module.exports = Block;