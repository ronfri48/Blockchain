// Imports
const Consts = require('./consts.js')

// Initial consts
const consts = new Consts();

/**
 * This class is the bloomfilter module.
 */
class BloomFilter {
    /**
     * Constructor
     * @param {number} size - data size
     */
    constructor(size) {
        this.size = size;
        this.data = new Array(size).fill(0, 0);
        this.seed = [-1, 0, -1];
    }

    /**
     * Add new hashed member to the data
     * @param {string} hashedMemberToAdd - The new hashed member to add
     */
    add(hashedMemberToAdd) {
        this.seed.map(mod => this.calculateHash(hashedMemberToAdd, this.size, mod))
            .forEach(index => this.markAsOccupied(index));
    }

    /**
     * Check if member is already in our bloomfilter's data
     * @param {string} memberToCheck - The member to check if exists
     */
    exists(memberToCheck) {
        return this.seed
            .map(mod => this.calculateHash(memberToCheck, this.size, mod))
            .map(index => this.isOccupied(index))
            .reduce((acc, ele) => acc && ele, true);
    }

    /**
     * Mark index as already occupied index.
     * @param {int} index - The index to mark as already occupied index.
     */
    markAsOccupied(index) {
        this.data[index] = consts.ALREADY_OCCUPIED_MARK;
    }

    /**
     * Check if index is already occupied.
     * @param {int} index - The index to mark.
     */
    isOccupied(index) {
        // If data[index] = consts.ALREADY_OCCUPIED_MARK -> the index is already occupied
        return consts.ALREADY_OCCUPIED_MARK === this.data[index];
    }

    /**
     * Calculate hash of given data.
     * @param {string} data - The data to make hash on.
     * @param {int} size - The size of the data to hash
     * @param {int} mod - The mod number to hash the data with.
     */
    calculateHash(data, size, mod) {
        const dataHash = data.split("")
            .map((character, index) => (character.charCodeAt() + mod * 1) * index + 1)
            .reduce((acc, ele) => acc + ele);
        return Math.floor(dataHash % size);
    }
}

module.exports = BloomFilter;