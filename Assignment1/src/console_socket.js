/**
 * This class is a mock of a socket, in order to give the server all the client utils without
 * writing any additional code.
 */
class ConsoleSocket {
    // Constructor
    constructor() {}

    // Mock of write function
    write(message) {
        console.log(message);
    }
}

module.exports = ConsoleSocket;