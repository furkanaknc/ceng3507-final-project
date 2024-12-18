import { Order } from '../class/order.class.js';
import { fetchOrders, saveOrders } from '../storage/order.storage.js';
import { readProducts,updateProductStock } from './product.util.js';
import { OrderStatus } from '../enum/order-status.enum.js';
import { readCustomers } from './customer.util.js';
import { readStorages } from './storage.util.js';
import { saveStorages } from '../storage/storage.storage.js';
import { Storage } from '../class/storage.class.js';

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

    // Get all storages and their contents
    const storages = readStorages().map(s => {
        const storage = new Storage(s.id, s.location, s.name, s.maxCapacity);
        storage.currentCapacity = s.currentCapacity || 0;
        storage.contents = s.contents || { raw: [], processed: [] };
        return storage;
    });

    // Find storages containing the product
    let remainingQuantity = quantity;
    const updatedStorages = storages.map(storage => {
        if (remainingQuantity <= 0) return storage;

        const processedProduct = storage.contents.processed.find(p => p.productId === productId);
        if (!processedProduct) return storage;

        const quantityToDeduct = Math.min(remainingQuantity, processedProduct.quantity);
        processedProduct.quantity -= quantityToDeduct;
        storage.currentCapacity -= (quantityToDeduct * product.weight) / 1000; // Convert to kg
        remainingQuantity -= quantityToDeduct;

        // Remove product from storage if quantity is 0
        if (processedProduct.quantity <= 0) {
            storage.contents.processed = storage.contents.processed.filter(p => p.productId !== productId);
        }

        return storage;
    });

    if (remainingQuantity > 0) {
        throw new Error(`Insufficient stock in storages. Missing ${remainingQuantity} units`);
    }

    // Save updated storages
    saveStorages(updatedStorages);

    // Create and save order
    const orders = fetchOrders();
    const newId = orders.length ? Math.max(...orders.map(o => o.id)) + 1 : 1;

    try {
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
    const orders = fetchOrders();
    return orders.map(order => {
        // Convert JSON data to Order instance
        const orderObj = new Order(
            order.id,
            order.customerId,
            order.productId,
            order.productCategory,
            order.quantity,
            order.unitPrice,
            order.status
        );
        // Preserve the original order date
        orderObj.orderDate = order.orderDate;
        return orderObj;
    });
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

