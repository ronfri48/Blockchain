// optional states
const states = {
    WAITING_FOR_CHOICE: "WAITING_FOR_CHOICE",
    NEW_TRANSACTION_DATA_WAITING_FOR_DATA: "NEW_TRANSACTION_DATA_WAITING_FOR_DATA",
    WAITING_FOR_TRANSACTION_VALIDATION_DATA: "WAITING_FOR_TRANSACTION_VALIDATION_DATA"
}

/**
 * This class represnts a state
 */
class States {
    constructor() {
        this.states = states;
    }
}

/**
 * This class represents a socket with state
 */
class StatedSocket {
    constructor(socket) {
        this.socket = socket;
        this.resetState(); // Set the state to the initial state
    }

    /**
     * Set the state to the initial state
     */
    resetState() {
        this.state = states.WAITING_FOR_CHOICE;
    }

    /**
     * Move the socket to new state, but before moving - validate that the move is valid.
     * @param {State} newState 
     */
    moveToNewState(newState) {
        if (!this.isValidMove(newState)) {
            throw "Move from: " + this.state + ' to: ' + newState + ' is invalid';
        }

        this.state = newState;
    }

    /**
     * Check if moving is valid
     * @param {State} newState 
     */
    isValidMove(newState) {
        switch (newState) {
            case states.WAITING_FOR_CHOICE:
                // We can move from the basic state to every state except self move
                return states.WAITING_FOR_CHOICE !== this.state;

            case states.NEW_TRANSACTION_DATA_WAITING_FOR_DATA:
                // We can move from this state only to the basic state
                return states.WAITING_FOR_TRANSACTION_VALIDATION_DATA !== this.state;

            case states.WAITING_FOR_TRANSACTION_VALIDATION_DATA:
                // We can move from this state only to the basic state
                return states.NEW_TRANSACTION_DATA_WAITING_FOR_DATA !== this.state;

            default:
                return false;
        }
    }
}

module.exports.StatedSocket = StatedSocket
module.exports.States = States