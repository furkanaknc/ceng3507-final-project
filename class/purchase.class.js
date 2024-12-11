export class Purchase {
    constructor(id, farmerId, date, quantity, pricePerKg) {
        this.id = id;
        this.farmerId = farmerId;
        this.date = date;
        this.quantity = quantity; 
        this.pricePerKg = pricePerKg;
        this.totalCost = quantity * pricePerKg;
    }
}