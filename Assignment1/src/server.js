const Consts = require('./consts.js')
const topology = require('fully-connected-topology')
const Blockchain = require('./blockchain.js')
const Transaction = require('./transaction.js')
const {
    StatedSocket,
    States
} = require('./stated_socket.js')
const ConsoleSocket = require('./console_socket.js')

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
var blockchain = new Blockchain(argv[2]);

log('---------------------')
log('Welcome to p2p blockchain network!, Im the best server in the world.')
log('me - ', me)
log('peers - ', peers)
log('connecting to peers...')

const myIp = toLocalIp(me)
const peerIps = getPeerIps(peers)

sockets[me] = new StatedSocket(new ConsoleSocket());
writeToClient(me, consts.MAIN_MESSAGE.toString().trim());

//connect to peers
topology(myIp, peerIps).on('connection', (socket, peerIp) => {
    const peerPort = extractPortFromIp(peerIp)
    log(peerPort, ' connected to me')
    sockets[peerPort] = new StatedSocket(socket)

    try {
        writeToClient(peerPort, consts.MAIN_MESSAGE.toString().trim())
    } catch {
        writeBroadcastMessage(socket, consts.MAIN_MESSAGE.toString().trim());
    }

    stdin.on('data', data => { //on user input
        const message = data.toString().trim();

        if ('exit' === message) { //on exit
            log('Bye bye')
            exit(0)
        }

        log('User data is: ', message.toString('utf8'));
        handleUserChoice(message, true);
    })

    socket.on('data', data => {
        const receivedMessage = data.toString().trim();
        log('Sent data is: ', receivedMessage.toString('utf8'));
        handleUserChoice(receivedMessage, false);
    })
})

// extract ports from process arguments, {me: first_port, peers: rest... }
function extractPeersAndMyPort() {
    return {
        me: argv[3],
        peers: argv.slice(4, argv.length)
    }
}

function writeBroadcastMessage(socket, message) {
    socket.write(formatMessage(message))
}

function writeToClient(receiverPeer, message) {
    if (sockets[receiverPeer].socket) { //message to specific peer
        message = message.toString().trim();
        sockets[receiverPeer].socket.write(formatMessage(message))
    } else {
        throw "Can not send to " + receiverPeer;
    }
}

function handleUserChoice(message, isSelf) {
    var [
        receiverPeer,
        receiverPeerMessage
    ] = extractPeerAndMessage(message)

    if (isSelf) {
        receiverPeerMessage = receiverPeer;
        receiverPeer = me;
    }

    var peerSocket = sockets[receiverPeer];

    switch (receiverPeerMessage) {
        case consts.NEW_TRANSACTION_CHOICE:
            writeToClient(receiverPeer, consts.INSERT_TRANSACTION_DATA_MESSAGE);
            peerSocket.moveToNewState(socketStates.NEW_TRANSACTION_DATA_WAITING_FOR_DATA);
            return;
        case consts.VALIDATE_TRANSACTION_CHOICE:
            writeToClient(receiverPeer, consts.VALIDATE_TRANSACTION_DATA_MESSAGE);
            peerSocket.moveToNewState(socketStates.WAITING_FOR_TRANSACTION_VALIDATION_DATA);
            return;
        case consts.GET_MY_ACCOUNT:
            writeToClient(receiverPeer, blockchain.getBalanceOfAddress(receiverPeer.toString().trim()));
            break;
        case "4":
            blockchain.dumpToJson("blockchain.json");
            break;
        default:
            handleUserData(receiverPeer, receiverPeerMessage);
    }

    writeToClient(receiverPeer, consts.MAIN_MESSAGE);
    sockets[receiverPeer].resetState();
}

function handleUserData(receiverPeer, message) {
    const peerSocket = sockets[parseInt(receiverPeer)];
    switch (peerSocket.state) {
        case socketStates.NEW_TRANSACTION_DATA_WAITING_FOR_DATA:
            const [toAddress, amount] = extractTransactionFromMessage(message);
            const transaction = new Transaction(receiverPeer, toAddress, amount);
            blockchain.addTransaction(transaction);
            peerSocket.socket.write("Added Transaction Successfully");
            break;
        case socketStates.WAITING_FOR_TRANSACTION_VALIDATION_DATA:
            const [isValid, svp] = blockchain.findHash(message.toString().trim());
            peerSocket.socket.write("Is transaction : " + message + " valid: " + isValid + ", svp: " + svp);
            break;
        default:
            peerSocket.socket.write("Error, invalid state ! ");
    }
}

//'4000' -> '127.0.0.1:4000'
function toLocalIp(port) {
    return '127.0.0.1:' + port
}
//['4000', '4001'] -> ['127.0.0.1:4000', '127.0.0.1:4001']
function getPeerIps(peers) {
    return peers.map(peer => toLocalIp(peer))
}
//'hello' -> 'myPort:hello'
function formatMessage(message) {
    return me + '>' + message
}
//'127.0.0.1:4000' -> '4000'
function extractPortFromIp(peer) {
    return peer.toString().slice(peer.indexOf(":") + 1, peer.length)
}
//'4000>hello' -> '4000'
function extractReceiverPeer(message) {
    return message.slice(0, message.indexOf(">"));
}
//'4000>hello' -> 'hello'
function extractMessageToSpecificPeer(message) {
    return message.slice(message.indexOf(">") + 1, message.length);
}

function extractPeerAndMessage(message) {
    return [
        extractReceiverPeer(message),
        extractMessageToSpecificPeer(message)
    ];
}

function extractTransactionFromMessage(message) {
    const [
        toAddress,
        amount
    ] = message.split(consts.AMOUNT_SEPARATOR);
    return [toAddress, parseFloat(amount)];
}