// My reward is from nothing to my address - The last transaction, so my reward will be in the next block
class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    toJson() {
        return "{\"fromAddress\": " + this.fromAddress +
            ", \"toAddress\": " + this.toAddress + ", \"amount\": " + this.amount + "}";
    }
}

module.exports = Transaction