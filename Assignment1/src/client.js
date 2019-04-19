const topology = require('fully-connected-topology')
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

log('---------------------')
log('Welcome to p2p blockchain network!, Im  a client.')
log('me - ', me)
log('peers - ', peers)
log('connecting to peers...')

const myIp = toLocalIp(me)
const peerIps = getPeerIps(peers)

//connect to peers
topology(myIp, peerIps).on('connection', (socket, peerIp) => {
    const peerPort = extractPortFromIp(peerIp)
    log(peerPort, ' connected to me')
    sockets[peerPort] = new StatedSocket(socket)

    stdin.on('data', data => { //on user input
        const message = data.toString().trim()

        if (message === 'exit') { //on exit
            log('Bye bye')
            exit(0)
        }

        sockets[peerPort].socket.write(formatMessage(message));
    })

    //print data when received
    socket.on('data', data => {
        message = data.toString().trim()
        log(message);
    })
})

// extract ports from process arguments, {me: first_port, peers: rest... }
function extractPeersAndMyPort() {
    return {
        me: argv[3],
        peers: argv.slice(4, argv.length)
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