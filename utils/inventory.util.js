import { saveInventory, fetchInventory } from "../storage/inventory.storage.js";
import { updateRawProductStorage } from "./raw-product.util.js";
import { readProducts, updateProductStock } from "./product.util.js";
import { ProductType } from "../enum/product-types.enum.js";
import { fetchRawProducts } from "../storage/raw-product.storage.js";
import { updateStorageCapacity } from "./storage.util.js";

export function createInventoryItem(storageId, type, category, quantity, reorderLevel, restockDate) {
    const inventory = fetchInventory();
    const newId = inventory.length ? Math.max(...inventory.map(item => item.id)) + 1 : 1;
    let totalWeight = 0;

    // Check available stock
    if (type === ProductType.RAW) {
        const rawProducts = fetchRawProducts();
        const rawProduct = rawProducts.find(p => p.type === ProductType.RAW);
        
        if (!rawProduct || rawProduct.weight < quantity * 1000) {
            throw new Error('Insufficient raw product stock');
        }
        updateRawProductStorage(-quantity * 1000); // Convert kg to grams
        totalWeight = quantity * 1000; // Total weight in grams
    } else {
        const products = readProducts();
        const product = products.find(p => p.id === category);
        if (!product || product.quantity < quantity) {
            throw new Error('Insufficient processed product stock');
        }
        updateProductStock(product.id, -quantity);
        totalWeight = product.weight * quantity; // Total weight in grams
    }

    // Update storage capacity
    updateStorageCapacity(storageId, totalWeight / 1000); // Convert grams to kg

    const item = {
        id: newId,
        storageId,
        type,
        category,
        quantity,
        totalWeight: totalWeight / 1000, // Convert grams to kg
        reorderLevel,
        restockDate
    };

    inventory.push(item);
    saveInventory(inventory);
    return item;
}

export function readInventory() {
    return fetchInventory();
}

export function updateInventoryItem(id, updatedData) {
    const inventory = fetchInventory();
    const index = inventory.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Item not found');

    inventory[index] = { ...inventory[index], ...updatedData };
    saveInventory(inventory);
    return inventory[index];
}

export function deleteInventoryItem(id) {
    const inventory = fetchInventory();
    const updatedInventory = inventory.filter(item => item.id !== id);
    saveInventory(updatedInventory);
}

export function getInventoryByType(type) {
    const inventory = fetchInventory();
    return inventory.filter(item => item.type === type);
}

export function checkReorderLevels() {
    const inventory = fetchInventory();
    return inventory.filter(item => item.quantity <= item.reorderLevel);
}