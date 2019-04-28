// Imports
const Consts = require('./consts.js')
const Block = require('./block.js')
const Transaction = require('./transaction.js')
const Fs = require('fs')

// Initial consts
const consts = new Consts();

/**
 * This class represnets a blockchain.
 */
class Blockchain {
    /**
     * Constructor for the Blockchain.
     * 1. Loads the initial blocks from the json.
     * 2. Creates an initial empty block.
     * @param {string} jsonPath The path for the initial json to load the initial blocks from.
     */
    constructor(jsonPath) {
        this.chain = [];
        this.loadFromJson(jsonPath);
        this.difficulty = consts.DIFFICULTY;
        this.currentBlock = new Block(Date.now(), new Array());
    }
    /**
     * Loads initial blocks from given json file.
     * @param {string} jsonPath The json's path to load the initial blocks from.
     */
    loadFromJson(jsonPath) {
        var data = Fs.readFileSync(jsonPath, 'utf8');
        var jsonData = JSON.parse(data);

        jsonData[consts.INITIAL_BLOCKS_KEY].forEach(element => {
            this.chain.push(this.makeBlockObject(element));
        });
    }

    /**
     * Save the blockchain to a json file.
     * @param {string} jsonPath The path to dump the blockchain to.
     */
    dumpToJson(jsonPath) {
        var jsonStr = "";

        this.chain.forEach(block => {
            if ("" === jsonStr) {
                jsonStr += "{\"blocks\": [";
            } else {
                jsonStr += ", ";
            }
            jsonStr += block.toJson();
        });

        jsonStr += "]}"
        Fs.writeFileSync(jsonPath, jsonStr);
    }

    /**
     * Load block object from a json.
     * @param {JSON} blockAsJson block as a json.
     * @returns {Block}
     */
    makeBlockObject(blockAsJson) {
        var transactions = Array();

        blockAsJson["transactions"].forEach(transaction => {
            transactions.push(new Transaction(
                transaction["fromAddress"],
                transaction["toAddress"],
                parseInt(transaction["amount"])));
        });

        var block = new Block(blockAsJson["timestamp"], transactions, blockAsJson["previousHash"]);

        return block;
    }

    /**
     * Get the latest block from the blockchain.
     */
    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    /**
     * Add a new transaction to the blockchain - 
     *  1. If after appending the transaction the current block is full - 
     *      1.1. Close the block & Add the block to the blockchain.
     *      1.2. Create a new empty block.
     *  2. Otherwise - Just add the new transaction to the block.
     * @param {Transaction} transaction The transaction to add to the blockchain
     */
    addTransaction(transaction) {
        var response = "Transaction added successfully, hash: " + this.currentBlock.merkleHashFunc(transaction) + "\n";
        this.currentBlock.append(transaction)
        if (consts.TRANSACTIONS_IN_BLOCK === this.currentBlock.size()) {
            this.currentBlock.calculateHash(); // Close the current block
            const hash = this.addBlock(this.currentBlock); // Add the current block
            response += " Transaction's block was mined, and the hash is: ";
            response += hash;
            this.currentBlock = new Block(Date.now(), new Array()); // Create a new empty block
        }

        return response;
    }

    /**
     * Check if hash is in the blockchain using bloomfilter.
     * @param {string} transactionHash The hash to check if exists in the blockchain
     */
    findHash(transactionHash) {
        var result = [false, NaN];
        // For each block, check if the hash is in the block using the bloomfilter.
        this.chain.forEach(block => {
            if (block.bloomFilter.exists(transactionHash)) {
                // If found - get the proof and return the verificaion result and the proof.
                const root = block.merkle.getRoot();
                const proof = block.merkle.getProof(transactionHash);
                if (block.merkle.verify(proof, transactionHash, root)) {
                    result = [true, proof];
                }
            }
        });

        return result;
    }

    /**
     * Add a new block to the chain
     * @param {Block} newBlock The block to 
     * @returns {string} new block hash
     */
    addBlock(newBlock) {
        // If exists a latest block - save its hash as prev hash, otherwise use the default hash
        const lastestBlock = this.getLatestBlock();
        if (lastestBlock) {
            newBlock.previousHash = lastestBlock.hash;
        } else {
            newBlock.previousHash = consts.DEFAULT_HASH;
        }

        // Mine the block and add it to the chain
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);

        return newBlock.hash;
    }

    /**
     * Check if the hash is valid or not by comparing prev hash to real prev block's hash.
     */
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

    /**
     * Get the balance of given address by iterating over transactions, while handling cheating tries.
     * Such as: Moving money from x to x.
     * @param {number} address The address to get its' balance
     * @returns {number} balance
     */
    getBalanceOfAddress(address) {
        let balance = 0;

        for (const block of this.chain) {
            for (const trans of block.transactions) {
                if (trans.fromAddress.toString() === address.toString()) {
                    balance -= trans.amount;
                }

                if (trans.toAddress.toString() === address.toString()) {
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }
}

module.exports = Blockchain;