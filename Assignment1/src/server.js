const consts = require('./consts.js')
const topology = require('fully-connected-topology')
const Blockchain = require('./blockchain.js')
const Transaction = require('./blockchain.js')
const {
    StatedSocket,
    SocketStates
} = require('./stated_socket.js')
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
var blockchain = Blockchain();
blockchain.loadFromJson(argv[2]);

log('---------------------')
log('Welcome to p2p blockchain network!, Im the best server in the world.')
log('me - ', me)
log('peers - ', peers)
log('connecting to peers...')

const myIp = toLocalIp(me)
const peerIps = getPeerIps(peers)

//connect to peers
topology(myIp, peerIps).on('connection', (socket, peerIp) => {
    const peerPort = extractPortFromIp(peerIp)
    log(peerPort, ' connected to me')
    sockets[parseInt(peerPort)] = StatedSocket(socket)

    try {
        writeToClient(parseInt(peerPort), consts.MAIN_MESSAGE)
    } catch {
        writeBroadcastMessage(socket, consts.MAIN_MESSAGE);
    }

    stdin.on('data', data => { //on user input
        const message = data.toString().trim()

        if (message === 'exit') { //on exit
            log('Bye bye')
            exit(0)
        }

        log('User data is: ', data.toString('utf8'));
        handleUserChoice(data);
    })

    //print data when received
    socket.on('data', data => {
        log('User data is: ', data.toString('utf8'));
        handleUserChoice(data);
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
        sockets[receiverPeer].socket.write(formatMessage(message))
    } else {
        throw "Can not send to " + receiverPeer;
    }
}

function handleUserChoice(message) {
    const receiverPeer, receiverPeerMessage = extractPeerAndMessage(message)
    var peerSocket = sockets[parseInt(receiverPeer)];
    switch (receiverPeerMessage) {
        case consts.NEW_TRANSACTION_CHOICE:
            writeToClient(receiverPeer, consts.INSERT_TRANSACTION_DATA_MESSAGE);
            peerSocket.moveToNewState(SocketStates.NEW_TRANSACTION_DATA_WAITING_FOR_DATA);
            break;
        case consts.VALIDATE_TRANSACTION_CHOICE:
            writeToClient(receiverPeer, consts.VALIDATE_TRANSACTION_DATA_MESSAGE);
            peerSocket.moveToNewState(SocketStates.WAITING_FOR_TRANSACTION_VALIDATION_DATA);
            break;
        default:
            handleUserData(receiverPeer, receiverPeerMessage);
            writeToClient(receiverPeer, consts.MAIN_MESSAGE);
            sockets[parseInt(receiverPeer)].resetState();
    }
}

function handleUserData(receiverPeer, message) {
    const peerSocket = sockets[parseInt(receiverPeer)];
    switch (peerSocket.state) {
        case SocketStates.NEW_TRANSACTION_DATA_WAITING_FOR_DATA:
            blockchain.createTransaction(new Transaction(extractTransactionFromMessage(message)));
            peerSocket.socket.write("Added Transaction Successfully");
            break;
        case SocketStates.WAITING_FOR_TRANSACTION_VALIDATION_DATA:
            peerSocket.socket.write("Is transaction : " + message + " valid: " + blockchain.findHash(message));
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
    return peer.toString().slice(peer.length - 4, peer.length);
}
//'4000>hello' -> '4000'
function extractReceiverPeer(message) {
    return message.slice(0, 4);
}
//'4000>hello' -> 'hello'
function extractMessageToSpecificPeer(message) {
    return message.slice(5, message.length);
}

function extractPeerAndMessage(message) {
    return extractReceiverPeer(message), extractMessageToSpecificPeer(message);
}

function extractTransactionFromMessage(message) {
    const fromAddress, otherData = message.slice(consts.ADDRESSES_SEPARATOR);
    const toAddress, amount = otherData.clice(consts.AMOUNT_SEPARATOR);
    return fromAddress, toAddress, parseFloat(amount);
}