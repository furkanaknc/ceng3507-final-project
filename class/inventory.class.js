export class Inventory {
    constructor(id, category, quantity, reorderLevel, restockDate, storageLocation, type, source) {
        this.id = id;
        this.category = category;
        this.quantity = quantity;
        this.reorderLevel = reorderLevel;
        this.restockDate = restockDate;
        this.storageLocation = storageLocation;
        this.type = type; // RAW or PROCESSED
        this.source = source; // From which storage it came
        this.lastUpdated = new Date();
    }

    needsRestock() {
        return this.quantity <= this.reorderLevel;
    }

    getStatus() {
        if (this.quantity <= this.reorderLevel) return 'LOW';
        if (this.quantity <= this.reorderLevel * 2) return 'MEDIUM';
        return 'SUFFICIENT';
    }

    updateQuantity(change) {
        const newQuantity = this.quantity + change;
        if (newQuantity < 0) {
            throw new Error('Insufficient stock');
        }
        this.quantity = newQuantity;
        this.lastUpdated = new Date();
    }
}