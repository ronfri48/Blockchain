// Imports
const topology = require('fully-connected-topology')
const {
    StatedSocket,
    SocketStates
} = require('./stated_socket.js')

// Initial consts
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

// The sockets container
const sockets = {}

// Start "Command Line GUI" for client
log('---------------------')
log('Welcome to p2p blockchain network!, Im a client. I love blockchain :)')
log('me - ', me)
log('server - ', peers)
log('connecting to server...')

// Save my ip and peers ip (Can be extended to some servers)
const myIp = toLocalIp(me)
const peerIps = getPeerIps(peers)

//connect to server (can be servers)
topology(myIp, peerIps).on('connection', (socket, peerIp) => {
    // Initialize me-peer connection stuff.
    const peerPort = extractPortFromIp(peerIp)
    log(peerPort, ' connected to me')
    sockets[peerPort] = new StatedSocket(socket)

    // On user input
    stdin.on('data', data => {
        const message = data.toString().trim()

        if (message === 'exit') { //on exit
            log('Bye bye')
            exit(0)
        }

        // Write to server the data I have got from my user
        sockets[peerPort].socket.write(formatMessage(message));
    })

    //print data when received for client work with the system
    socket.on('data', data => {
        message = data.toString().trim()
        log(message);
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
    return peer.toString().slice(peer.length - 4, peer.length);
}