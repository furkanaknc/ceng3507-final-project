export class Storage {
    constructor(id, location, name, maxCapacity) {
        this.id = id;
        this.location = location;
        this.name = name;
        this.maxCapacity = maxCapacity;
        this.currentCapacity = 0;
        this.contents = {
            raw: [],
            processed: []
        };
    }

    addRawFromPurchase(purchaseId, quantity) {
        const newCapacity = this.currentCapacity + quantity;
        if (newCapacity > this.maxCapacity) {
            throw new Error(`Insufficient storage capacity. Available: ${this.maxCapacity - this.currentCapacity}kg`);
        }
        this.contents.raw.push({ purchaseId, quantity });
        this.currentCapacity = newCapacity;
    }


    addProcessedProduct(productId, quantity, totalWeight) {
        if (this.currentCapacity + totalWeight > this.maxCapacity) {
            throw new Error(`Insufficient storage capacity. Available: ${this.maxCapacity - this.currentCapacity}kg`);
        }
        this.contents.processed.push({ productId, quantity, totalWeight });
        this.currentCapacity += totalWeight;
    }

    removeRawProduct(purchaseId) {
        const index = this.contents.raw.findIndex(item => item.purchaseId === purchaseId);
        if (index !== -1) {
            const item = this.contents.raw[index];
            this.currentCapacity -= item.quantity;
            this.contents.raw.splice(index, 1);
        }
    }

    removeProcessedProduct(productId) {
        const index = this.contents.processed.findIndex(item => item.productId === productId);
        if (index !== -1) {
            const item = this.contents.processed[index];
            this.currentCapacity -= item.totalWeight;
            this.contents.processed.splice(index, 1);
        }
    }

    getAvailableCapacity() {
        return this.maxCapacity - this.currentCapacity;
    }

    getRawProducts() {
        return this.contents.raw;
    }

    getProcessedProducts() {
        return this.contents.processed;
    }
}