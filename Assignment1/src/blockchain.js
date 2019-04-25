const Consts = require('./consts.js')
const Block = require('./block.js')
const Transaction = require('./transaction.js')
const Fs = require('fs')

const InitialBlocksKey = "blocks";
const consts = new Consts();

class Blockchain {

    constructor(jsonPath) {
        this.chain = [];
        this.loadFromJson(jsonPath);
        this.difficulty = consts.DIFFICULTY;
        this.currentBlock = new Block(Date.now(), new Array());
    }

    loadFromJson(jsonPath) {
        var data = Fs.readFileSync(jsonPath, 'utf8');
        var jsonData = JSON.parse(data);

        jsonData[InitialBlocksKey].forEach(element => {
            this.chain.push(this.makeBlockObject(element));
        });
    }

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

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addTransaction(transaction) {
        var response = "Transaction added successfully, hash: " + this.currentBlock.merkleHashFunc(transaction) + "\n";
        this.currentBlock.append(transaction)
        if (consts.TRANSACTIONS_IN_BLOCK === this.currentBlock.size()) {
            this.currentBlock.calculateHash();
            const hash = this.addBlock(this.currentBlock);
            response += " Transaction's block was mined, and the hash is: ";
            response += hash;
            this.currentBlock = new Block(Date.now(), new Array());
        }

        return response;
    }

    findHash(transactionHash) {
        this.chain.forEach(block => {
            if (block.bloomFilter.exists(transactionHash)) {
                const root = block.merkle.getRoot();
                const proof = block.merkle.getProof(Buffer.from(transactionHash));
                return [block.merkle.verify(proof, transactionHash, root), proof];
            }
        });

        console.log("Transaction not found, hash: " + transactionHash);
        return [false, NaN];
    }

    addBlock(newBlock) {
        const lastestBlock = this.getLatestBlock();
        if (lastestBlock) {
            newBlock.previousHash = lastestBlock.hash;
        } else {
            newBlock.previousHash = "0000000000000000000000000000000000000000000000000000000000000000";
        }

        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);

        return newBlock.hash;
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