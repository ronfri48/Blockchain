// Consts Class
class Consts {
    constructor() {
        // Menu consts
        this.NEW_TRANSACTION_CHOICE = "1";
        this.VALIDATE_TRANSACTION_CHOICE = "2";
        this.GET_MY_ACCOUNT = "3";
        this.MAIN_MESSAGE = "Choose what you want to do:\nPress 1 to apply new transaction\nPress 2 to receive transaction validation\nPress 3 to get your account\n";
        this.INSERT_TRANSACTION_DATA_MESSAGE = "Insert the transaction data in this format:\ntoAddress: amount"
        this.VALIDATE_TRANSACTION_DATA_MESSAGE = "Insert the hash to validate"

        // Data consts
        this.AMOUNT_SEPARATOR = ': ';
        this.TRANSACTIONS_IN_BLOCK = 4;
        this.DIFFICULTY = 2;
        this.INITIAL_BLOCKS_KEY = "blocks";
        this.DEFAULT_HASH = "0000000000000000000000000000000000000000000000000000000000000000";
        this.ALREADY_OCCUPIED_MARK = 1;
    }
}

module.exports = Consts;