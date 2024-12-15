import { Inventory } from '../class/inventory.class.js';
import { fetchInventory, saveInventory } from '../storage/inventory.storage.js';
import { readOrders } from './order.util.js';
import { readPurchases } from './purchase.util.js';
import { fetchProducts } from '../../storage/product.storage.js';
import { fetchRawProducts } from '../../storage/raw-product.storage.js';

export function createInventoryItem(category, quantity, reorderLevel, restockDate, storageLocation) {
    const inventory = fetchInventory();
    const newId = inventory.length ? Math.max(...inventory.map(i => i.id)) + 1 : 1;

    const item = new Inventory(
        newId,
        category,
        quantity,
        reorderLevel,
        restockDate,
        storageLocation
    );

    inventory.push(item);
    saveInventory(inventory);
    return item;
}

export function updateInventoryQuantity(id, change) {
    const inventory = fetchInventory();
    const item = inventory.find(i => i.id === id);

    if (!item) throw new Error('Inventory item not found');

    item.updateQuantity(change);
    saveInventory(inventory);
    checkLowStock(item);
    return item;
}

export function getInventoryStatus() {
    const inventory = fetchInventory();
    return inventory.map(item => {
        // Create an Inventory instance from the stored data
        const inventoryItem = new Inventory(
            item.id,
            item.category,
            item.quantity,
            item.reorderLevel,
            item.restockDate,
            item.storageLocation,
            item.type,
            item.source
        );

        return {
            ...item,
            status: inventoryItem.getStatus(),
            needsRestock: inventoryItem.needsRestock()
        };
    });
}

export function checkLowStock(item) {
    if (item.needsRestock()) {
        notifyLowStock(item);
    }
}

export function notifyLowStock(item) {
    const message = `Low stock alert: ${item.category} is below reorder level (${item.quantity}/${item.reorderLevel})`;
    showNotification(message, 'warning');
}

export function generateInventoryReport(startDate, endDate) {
    const inventory = fetchInventory();
    const orders = readOrders();
    const purchases = readPurchases();

    return inventory.map(item => {
        const itemOrders = orders.filter(o =>
            o.productCategory === item.category &&
            new Date(o.orderDate) >= new Date(startDate) &&
            new Date(o.orderDate) <= new Date(endDate)
        );

        const itemPurchases = purchases.filter(p =>
            p.category === item.category &&
            new Date(p.date) >= new Date(startDate) &&
            new Date(p.date) <= new Date(endDate)
        );

        return {
            category: item.category,
            currentStock: item.quantity,
            totalSales: itemOrders.reduce((sum, o) => sum + o.quantity, 0),
            totalPurchases: itemPurchases.reduce((sum, p) => sum + p.quantity, 0),
            turnoverRate: calculateTurnoverRate(item, itemOrders),
            status: item.getStatus()
        };
    });
}

function calculateTurnoverRate(item, orders) {
    const totalSold = orders.reduce((sum, o) => sum + o.quantity, 0);
    return totalSold / ((item.quantity + totalSold) / 2);
}

function showNotification(message, type) {
    const event = new CustomEvent('inventory-notification', {
        detail: { message, type }
    });
    document.dispatchEvent(event);
}

export function transferToInventory(sourceType, sourceId, quantity, location) {
    if (!quantity || quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
    }

    if (!location) {
        throw new Error('Storage location is required');
    }

    if (sourceType === 'RAW') {
        const rawProducts = fetchRawProducts();
        if (!rawProducts || rawProducts.length === 0) {
            throw new Error('No raw products available');
        }

        const rawProduct = rawProducts[0];
        const availableKg = rawProduct.weight / 1000; // Convert g to kg

        if (quantity > availableKg) {
            throw new Error(`Cannot transfer more than available quantity. Available: ${availableKg}kg`);
        }

        createInventoryItem('RAW', quantity, quantity / 2, new Date(), location);

    } else {
        const products = fetchProducts();
        const product = products.find(p => p.id === Number(sourceId));

        if (!product) {
            throw new Error('Product not found');
        }

        if (quantity > product.quantity) {
            throw new Error(`Cannot transfer more than available packages. Available: ${product.quantity} packages`);
        }

        // For processed products, use package count
        createInventoryItem(product.category, quantity, quantity / 2, new Date(), location);
    }
}

export function deleteInventoryItem(id) {
    const inventory = fetchInventory();
    const updatedInventory = inventory.filter(item => item.id !== id);
    saveInventory(updatedInventory);
}

export function updateInventoryItem(id, updates) {
    const inventory = fetchInventory();
    const itemIndex = inventory.findIndex(item => item.id === Number(id));
    
    if (itemIndex === -1) {
        throw new Error('Inventory item not found');
    }

    const currentItem = inventory[itemIndex];
    const requestedQuantity = Number(updates.quantity);
    
    // Different validation for RAW and PROCESSED products
    if (currentItem.type === 'RAW') {
        const rawProducts = fetchRawProducts();
        if (!rawProducts || rawProducts.length === 0) {
            throw new Error('No raw products available');
        }

        const rawProduct = rawProducts[0];
        const availableKg = rawProduct.weight / 1000; // Convert g to kg

        if (requestedQuantity > currentItem.quantity) {
            const additionalNeeded = requestedQuantity - currentItem.quantity;
            if (additionalNeeded > availableKg) {
                throw new Error(`Cannot update quantity. Only ${availableKg}kg available in raw products.`);
            }
        }
    } else {
        // For processed products
        const products = fetchProducts();
        const sourceProduct = products.find(p => p.category === currentItem.category);
        
        if (!sourceProduct) {
            throw new Error(`No source product found for category: ${currentItem.category}`);
        }

        if (requestedQuantity > currentItem.quantity) {
            const additionalNeeded = requestedQuantity - currentItem.quantity;
            if (additionalNeeded > sourceProduct.quantity) {
                throw new Error(`Cannot update quantity. Only ${sourceProduct.quantity} packages available.`);
            }
        }
    }

    // Update the item
    inventory[itemIndex] = {
        ...currentItem,
        quantity: requestedQuantity,
        reorderLevel: Number(updates.reorderLevel),
        lastUpdated: new Date()
    };
    
    saveInventory(inventory);
    return inventory[itemIndex];
}