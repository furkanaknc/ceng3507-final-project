export class Purchase {
    constructor(id, farmerId, storageId, date, quantity, pricePerKg) {
        this.id = id;
        this.farmerId = farmerId;
        this.storageId = storageId;
        this.date = date;
        this.quantity = quantity;
        this.pricePerKg = pricePerKg;
        this.totalCost = quantity * pricePerKg;
    }
}