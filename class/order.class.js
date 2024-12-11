export class Order {
    constructor(id, customerName, contact, shippingAddress, productCategory, quantity, unitPrice, status = OrderStatus.PENDING) {
        this.id = id;
        this.customerName = customerName;
        this.contact = contact;
        this.shippingAddress = shippingAddress;
        this.productCategory = productCategory;
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
