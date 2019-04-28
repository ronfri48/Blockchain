// Imports
const SHA256 = require("crypto-js/sha256")
const MerkleTree = require('merkletreejs')
const BloomFilter = require('./bloomfilter.js')
const Transaction = require('./transaction.js')

/**
 * This class represents a block in the blockchain.
 */
class Block {
    /**
     * Constructor for Block.
     *
     * The constructor (that initializes the block).
     *
     * @access     public
     *
     * @constructs Block
     *
     * @param {number} timestamp                  The timestamp when the block was mined.
     * @param {Array(Transaction)} transactions   The transactions that makes up the block.
     * @param {string} previousHash               The hash of the prev block.
     */
    constructor(timestamp, transactions, previousHash = '') {
        // Initialize all the variables
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.transactions = transactions;

        // Calculate the hash of the current block
        this.hash = this.calculateHash();
        this.nonce = 0;

        // Create the bloom filter
        this.bloomFilter = new BloomFilter(4);
        transactions.forEach(transaction => {
            this.bloomFilter.add(this.merkleHashFunc(transaction));
        });
    }

    /**
     * Casting for Block to stringified json
     */
    toJson() {
        var blockJson = "";

        // Block & Transaction structure
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

    /**
     * Add new transaction to the block. 
     * 
     * @param {Transaction} transaction The transaction to add to the block.
     */
    append(transaction) {
        this.transactions.push(transaction);
        this.bloomFilter.add(this.merkleHashFunc(transaction));
    }

    /**
     * Generate the merkle hash for the transaction
     * @param {Transaction} transaction The transaction to calculate the hash func on. 
     */
    merkleHashFunc(transaction) {
        return SHA256(JSON.stringify(transaction)).toString();
    }

    /**
     * Generate the hash for the block.
     */
    hashFunc() {
        return SHA256(this.timestamp + JSON.stringify(this.merkle.getRoot().toString('hex')) + this.nonce + this.previousHash).toString();
    }

    /**
     * Calculates the hash for the block:
     *  1. Creates the Merkle tree for the block.
     *  2. Returns merkle tree root.
     */
    calculateHash() {
        this.generateMerkle();
        return this.hashFunc();
    }

    /**
     * Generates the merkle tree for the block. 
     */
    generateMerkle() {
        const leaves = this.transactions.map(transaction => this.merkleHashFunc(transaction));
        this.merkle = new MerkleTree.MerkleTree(leaves, this.merkleHashFunc);
    }

    /**
     * Get number of transaction currently in the block.
     */
    size() {
        return this.transactions.length;
    }

    /**
     * Mine the block. 
     * @param {number} difficulty The difficulty for block mining.
     */
    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log("BLOCK MINED: " + this.hash + " " + this.nonce);
    }
}

module.exports = Block;