import { OrderStatus } from '../enum/order-status.enum.js';

export class Order {
    constructor(id, customerId, productId, productCategory, productType, quantity, unitPrice, status = OrderStatus.PENDING) {
        this.id = id;
        this.customerId = customerId;
        this.productId = productId;
        this.productCategory = productCategory;
        this.productType = productType;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.status = status;
        this.orderDate = new Date().toISOString();
        this.totalPrice = this.calculateTotal();
    }

    calculateTotal() {
        return this.quantity * this.unitPrice;
    }
}