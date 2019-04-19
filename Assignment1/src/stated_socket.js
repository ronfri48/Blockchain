const states = {
    WAITING_FOR_CHOICE: "WAITING_FOR_CHOICE",
    NEW_TRANSACTION_DATA_WAITING_FOR_DATA: "NEW_TRANSACTION_DATA_WAITING_FOR_DATA",
    WAITING_FOR_TRANSACTION_VALIDATION_DATA: "WAITING_FOR_TRANSACTION_VALIDATION_DATA"
}

class States {
    constructor() {
        this.states = states;
    }
}

class StatedSocket {
    constructor(socket) {
        this.socket = socket;
        this.resetState();
    }

    resetState() {
        this.state = states.WAITING_FOR_CHOICE;
    }

    moveToNewState(newState) {
        if (!this.isValidMove(newState)) {
            throw "Move from: " + this.state + ' to: ' + newState + ' is invalid';
        }

        this.state = newState;
    }

    isValidMove(newState) {
        switch (newState) {
            case states.WAITING_FOR_CHOICE:
                return states.WAITING_FOR_CHOICE !== this.state;

            case states.NEW_TRANSACTION_DATA_WAITING_FOR_DATA:
                return states.WAITING_FOR_TRANSACTION_VALIDATION_DATA !== this.state;

            case states.WAITING_FOR_TRANSACTION_VALIDATION_DATA:
                return states.NEW_TRANSACTION_DATA_WAITING_FOR_DATA !== this.state;

            default:
                return false;
        }
    }
}

module.exports.StatedSocket = StatedSocket
module.exports.States = States