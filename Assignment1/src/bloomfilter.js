class BloomFilter {
    /**
     * Ctor
     * @param {number} size - data size
     */
    constructor(size) {
        this.size = size;
        this.data = new Array(size).fill(0, 0);
        this.seed = [-1, 0, -1];
    }

    /**
     * Add new hashed member to the storage
     * @param {string} memberToAdd - The new string to add
     */
    add(memberToAdd) {
        this.seed.map(mod => this._calculateHash(memberToAdd, this.size, mod))
            .forEach(index => this._markAsOccupied(index));
    }

    /**
     * Check if member is already in our data
     * @param {string} member - The member to check if exists
     */
    exists(member) {
        return this.seed
            .map(mod => this._calculateHash(member, this.size, mod))
            .map(index => this._isOccupied(index))
            .reduce((acc, ele) => acc && ele, true);
    }

    /**
     * Mark index as occupied index.
     * @param {int} index - The index to mark.
     */
    _markAsOccupied(index) {
        this.data[index] = 1;
    }

    /**
     * Check if index is occupied.
     * @param {int} index - The index to mark.
     */
    _isOccupied(index) {
        // If storage[index] = 1 -> the index is occupied
        return !!this.storage[index];
    }

    /**
     * Calculate hash of given data.
     * @param {string} datatoHash - The data to make hash on.
     * @param {int} size
     * @param {int} mod - The mod to hash with.
     */
    _calculateHash(datatoHash, size, mod) {
        const hash = datatoHash.split("")
            .map((ch, i) => (ch.charCodeAt() + mod * 1) * i + 1)
            .reduce((acc, ele) => acc + ele);
        return Math.floor(hash % size);
    }
}

module.exports = BloomFilter;