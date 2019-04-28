// Imports
const Consts = require('./consts.js')
const topology = require('fully-connected-topology')
const Blockchain = require('./blockchain.js')
const Transaction = require('./transaction.js')
const {
    StatedSocket,
    States
} = require('./stated_socket.js')
const ConsoleSocket = require('./console_socket.js')

// Initial Consts
const consts = new Consts();
const socketStates = new States().states;
const {
    stdin,
    exit,
    argv
} = process
const {
    log
} = console
const {
    me,
    peers
} = extractPeersAndMyPort()


const sockets = {}
// Init the blockchain with the intital blocks json path
const initialBlocksJsonPath = argv[2];
var blockchain = new Blockchain(initialBlocksJsonPath);

log('---------------------')
log('Welcome to p2p blockchain network!, Im the best server in the world.')
log('me - ', me)
log('peers - ', peers)
log('connecting to peers...')

const myIp = toLocalIp(me);
const peerIps = getPeerIps(peers);

// Add the server as socket with the socket mock
sockets[me] = new StatedSocket(new ConsoleSocket());
// Write the main menu to the server as well
writeToClient(me, consts.MAIN_MESSAGE.toString().trim());

//On server user input
stdin.on('data', data => {
    const message = data.toString().trim();

    if ('exit' === message) { //on exit
        log('Bye bye')
        exit(0)
    }

    log('Server User data is: ', message.toString('utf8'));
    handleUserChoice(message, true);
});

//connect to peers
topology(myIp, peerIps).on('connection', (socket, peerIp) => {
    // Initialzie server-client connection stuff
    const peerPort = extractPortFromIp(peerIp)
    log(peerPort, ' connected to me')
    sockets[peerPort] = new StatedSocket(socket)

    // Try to write to client or for all the connected clients.
    try {
        writeToClient(peerPort, consts.MAIN_MESSAGE.toString().trim())
    } catch {
        writeMessageToSocket(socket, consts.MAIN_MESSAGE.toString().trim());
    }

    // On data from clients
    socket.on('data', data => {
        const receivedMessage = data.toString().trim();
        log('Sent data is: ', receivedMessage.toString('utf8'));
        handleUserChoice(receivedMessage, false);
    })
})

/**
 * Extract my and peers' ports from the args {me: first_port, peers: rest... }
 * @returns {string, Array(string)} {my port, peers ports}
 */
function extractPeersAndMyPort() {
    return {
        me: argv[3],
        peers: argv.slice(4, argv.length)
    }
}

/**
 * Write message to socket
 * @param {Socket} socket 
 * @param {string} message 
 */
function writeMessageToSocket(socket, message) {
    socket.write(formatMessage(message))
}

/**
 * Write message to given port
 * @param {string} receiverPeer The client to write to
 * @param {string} message The message to write
 */
function writeToClient(receiverPeer, message) {
    if (sockets[receiverPeer].socket) { //message to specific peer
        message = message.toString().trim();
        writeMessageToSocket(sockets[receiverPeer].socket, message);
    } else {
        throw "Can not send to " + receiverPeer;
    }
}

/**
 * Handle user choice (server or client) in the main menu.
 */
function handleUserChoice(message, isSelf) {
    // Set the needed vars for handling the communication
    var receiverPeer, receiverPeerMessage;
    if (isSelf) {
        receiverPeerMessage = message;
        receiverPeer = me;
    } else {
        [
            receiverPeer,
            receiverPeerMessage
        ] = extractPeerAndMessage(message);
    }

    var peerSocket = sockets[receiverPeer];

    // Check what is the gotten message
    switch (receiverPeerMessage) {
        case consts.NEW_TRANSACTION_CHOICE: // Add new transaction
            // Write the adding transaction menu to the client and update his socket state
            writeToClient(receiverPeer, consts.INSERT_TRANSACTION_DATA_MESSAGE);
            peerSocket.moveToNewState(socketStates.NEW_TRANSACTION_DATA_WAITING_FOR_DATA);
            return;
        case consts.VALIDATE_TRANSACTION_CHOICE: // Validate a transaction
            // Write the validating transaction menu to the client and update his socket state
            writeToClient(receiverPeer, consts.VALIDATE_TRANSACTION_DATA_MESSAGE);
            peerSocket.moveToNewState(socketStates.WAITING_FOR_TRANSACTION_VALIDATION_DATA);
            return;
        case consts.GET_MY_ACCOUNT:
            // Write to client his account balance
            writeToClient(receiverPeer, blockchain.getBalanceOfAddress(receiverPeer.toString().trim()));
            break;
        default:
            // Other input (error or relevant data input)
            handleUserData(receiverPeer, receiverPeerMessage);
    }

    writeToClient(receiverPeer, consts.MAIN_MESSAGE);
    sockets[receiverPeer].resetState();
}

/**
 * Handle user data - when this is not the choice but the data inserted after the choice
 * @param {string} receiverPeer The port of the client to communicate with.
 * @param {string} message The gotten message.
 */
function handleUserData(receiverPeer, message) {
    const peerSocket = sockets[parseInt(receiverPeer)];
    switch (peerSocket.state) {
        case socketStates.NEW_TRANSACTION_DATA_WAITING_FOR_DATA:
            // We are waiting for new transaction data
            const [toAddress, amount] = extractTransactionFromMessage(message);

            if (amount < 0) {
                // Negative amount transaction is forbidden.
                peerSocket.socket.write("Error! Can't make a negative transaction.");
                break;
            }

            // Creating the transaction
            const transaction = new Transaction(receiverPeer, toAddress, amount);
            const responseMessage = blockchain.addTransaction(transaction);
            peerSocket.socket.write(responseMessage);
            if (sockets[toAddress] !== undefined) {
                sockets[toAddress].socket.write("The transaction you get: " + responseMessage);
            }
            break;
        case socketStates.WAITING_FOR_TRANSACTION_VALIDATION_DATA:
            // We are waiting for transaction hash for validating it
            const [isValid, svp] = blockchain.findHash(message.toString().trim());
            peerSocket.socket.write("Is transaction : " + message + " valid: " + isValid + ", svp: " + svp);
            break;
        default:
            peerSocket.socket.write("Error, invalid state ! ");
    }
}

/**
 * Get local ip with port from port, for example: '4000' -> '127.0.0.1:4000'.
 * @param {number} port The port to Add local ip to.
 */
function toLocalIp(port) {
    return '127.0.0.1:' + port
}

/**
 * Get local ips with ports from peers ports list, 
 * for example: ['4000', '4001'] -> ['127.0.0.1:4000', '127.0.0.1:4001']
 * @param {Array(number)} peers The peers to get the ips of.
 */
function getPeerIps(peers) {
    return peers.map(peer => toLocalIp(peer))
}

/**
 * Format message to port: message
 * @param {string} message The message to format.
 * @returns {string}
 */
function formatMessage(message) {
    return me + '>' + message
}

/**
 * Extract port from ip+port structure. 
 * For example: '127.0.0.1:4000' -> '4000'
 * @param {string} peer The ip+port
 * @returns {string}
 */
function extractPortFromIp(peer) {
    return peer.toString().slice(peer.indexOf(":") + 1, peer.length)
}


/**
 * Extract the peer from the formatted message
 * @param {string} message 
 */
function extractReceiverPeer(message) {
    return message.slice(0, message.indexOf(">"));
}

/**
 * Extract the message from the formatted message
 * @param {string} message 
 */
function extractMessageToSpecificPeer(message) {
    return message.slice(message.indexOf(">") + 1, message.length);
}

/**
 * Extract the peer and the message from the formatted message
 * @param {string} message 
 */
function extractPeerAndMessage(message) {
    return [
        extractReceiverPeer(message),
        extractMessageToSpecificPeer(message)
    ];
}

/**
 * Extract transaction data from a message
 * (For adding a new transaction)
 * @param {string} message 
 */
function extractTransactionFromMessage(message) {
    const [
        toAddress,
        amount
    ] = message.split(consts.AMOUNT_SEPARATOR);
    return [toAddress, parseFloat(amount)];
}