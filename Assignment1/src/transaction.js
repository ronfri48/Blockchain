/**
 * This class represnts a transaction from address to address with amount
 */
class Transaction {
    constructor(fromAddress, toAddress, amount) {
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }

    /**
     * Dump transaction to a stringified json
     */
    toJson() {
        return "{\"fromAddress\": " + this.fromAddress +
            ", \"toAddress\": " + this.toAddress + ", \"amount\": " + this.amount + "}";
    }
}

module.exports = Transaction