class Consts {
    constructor() {
        this.NEW_TRANSACTION_CHOICE = "1";
        this.VALIDATE_TRANSACTION_CHOICE = "2";
        this.GET_MY_ACCOUNT = "3";
        this.MAIN_MESSAGE = "Choose what you want to do:\nPress 1 to apply new transaction\nPress 2 to receive transaction validation\nPress 3 to get your account\n";
        this.INSERT_TRANSACTION_DATA_MESSAGE = "Insert the transaction data in this format:\ntoAddress: amount"
        this.VALIDATE_TRANSACTION_DATA_MESSAGE = "Insert the hash to validate"
        this.AMOUNT_SEPARATOR = ': ';
        this.TRANSACTIONS_IN_BLOCK = 4;
        this.DIFFICULTY = 2;
    }
}

module.exports = Consts;