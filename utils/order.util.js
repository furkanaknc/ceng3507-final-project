import { Order } from '../class/order.class.js';
import { fetchOrders, saveOrders } from '../storage/order.storage.js';
import { readProducts,updateProductStock } from './product.util.js';
import { OrderStatus } from '../enum/order-status.enum.js';
import { readCustomers } from './customer.util.js';

export function createOrder(customerId, productId, quantity) {
    if (!quantity || quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
    }

    const customers = readCustomers();
    if (!customers.find(c => c.id === customerId)) {
        throw new Error('Invalid customer ID');
    }

    const products = readProducts();
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        throw new Error('Product not found');
    }

    if (product.quantity < quantity) {
        throw new Error(`Only ${product.quantity} units available in stock`);
    }

    const orders = fetchOrders();
    const newId = orders.length ? Math.max(...orders.map(o => o.id)) + 1 : 1;

    try {
        // First try to update stock
        updateProductStock(productId, -quantity);
        
        const order = new Order(
            newId,
            customerId,
            productId,
            product.category,
            quantity,
            product.price,
            OrderStatus.PENDING
        );

        orders.push(order);
        saveOrders(orders);
        return order;
    } catch (error) {
        throw new Error(`Could not create order: ${error.message}`);
    }
}

export function updateOrder(id, updatedData) {
    const orders = fetchOrders();
    const index = orders.findIndex(o => o.id === id);
    
    if (index === -1) throw new Error('Order not found');

    const currentOrder = orders[index];
    const productId = currentOrder.productId; 

    if (updatedData.quantity !== currentOrder.quantity) {
        const difference = updatedData.quantity - currentOrder.quantity;
        updateProductStock(productId, -difference);
    }

    orders[index] = {
        ...currentOrder,
        ...updatedData,
        totalPrice: updatedData.quantity * currentOrder.unitPrice
    };

    saveOrders(orders);
    return orders[index];
}

export function updateOrderStatus(id, newStatus) {
    const orders = fetchOrders();
    const index = orders.findIndex(o => o.id === id);

    if (index === -1) throw new Error('Order not found');

    orders[index].status = newStatus;
    saveOrders(orders);
    return orders[index];
}

export function getOrdersByStatus(status) {
    const orders = fetchOrders();
    return status ? orders.filter(o => o.status === status) : orders;
}

export function getOrdersByCustomer(customerId) {
    const orders = fetchOrders();
    return orders.filter(o => o.customerId === customerId);
}

export function readOrders() {
    return fetchOrders().map(o => new Order(
        o.id,
        o.customerId,
        o.productId,
        o.productCategory,
        o.quantity,
        o.unitPrice,
        o.status,
        o.orderDate
    ));
}

export function calculateRevenue(startDate = null, endDate = null, category = null) {
    const orders = fetchOrders();
    return orders
        .filter(order => {
            const orderDate = new Date(order.orderDate);
            const matchesDate = (!startDate || orderDate >= new Date(startDate)) &&
                (!endDate || orderDate <= new Date(endDate));
            const matchesCategory = !category || order.productCategory === category;
            return matchesDate && matchesCategory && order.status !== OrderStatus.CANCELLED;
        })
        .reduce((total, order) => total + order.totalPrice, 0);
}


export function searchOrders(query) {
    const orders = fetchOrders();
    const searchTerm = query.toLowerCase();

    return orders.filter(order =>
        order.customerName.toLowerCase().includes(searchTerm) ||
        order.productCategory.toLowerCase().includes(searchTerm) ||
        order.status.toLowerCase().includes(searchTerm)
    );
}

export function deleteOrder(id) {
    const orders = fetchOrders();
    const index = orders.findIndex(o => o.id === id);
    
    if (index === -1) throw new Error('Order not found');
    
    const order = orders[index];
    
    updateProductStock(order.productId, order.quantity);
    
    orders.splice(index, 1);
    saveOrders(orders);
}

