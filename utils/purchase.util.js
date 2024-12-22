import { savePurchases, fetchPurchases } from "../storage/purchase.storage.js";
import { Purchase } from "../class/purchase.class.js";
import { readFarmers } from "./farmer.util.js";
import { saveRawProducts, fetchRawProducts } from "../storage/raw-product.storage.js";
import { ProductType } from "../enum/product-types.enum.js";
import { saveStorages, fetchStorages } from "../storage/storage.storage.js";
import { Storage } from "../class/storage.class.js";
import { readStorages } from "./storage.util.js";

// Create new purchase and update storage with raw materials
export function createPurchase(farmerId, storageId, date, quantity, pricePerKg) {
    // Basic input validation
    if (!farmerId) throw new Error('Farmer is required');
    if (!storageId) throw new Error('Storage is required');
    if (!date) throw new Error('Date is required');
    if (!quantity || quantity <= 0) throw new Error('Valid quantity is required');
    if (!pricePerKg || pricePerKg <= 0) throw new Error('Valid price per kg is required');

    // Check if farmer exists
    const farmers = readFarmers();

    const farmerExists = farmers.some(farmer => farmer.id === farmerId);
    if (!farmerExists) {
        throw new Error('Invalid farmer ID');
    }

    // Check storage capacity
    const storages = fetchStorages().map(s => Object.assign(new Storage(), s));
    const storage = storages.find(s => s.id === storageId);
    if (!storage) throw new Error('Storage not found');

    // Calculate available space
    const availableCapacity = storage.maxCapacity - storage.currentCapacity;
    if (quantity > availableCapacity) {
        throw new Error(`Insufficient storage capacity. Only ${availableCapacity}kg available in ${storage.name}`);
    }

    // Create new purchase record
    const purchases = fetchPurchases();
    const newId = purchases.length ? Math.max(...purchases.map(p => p.id)) + 1 : 1;

    const purchase = new Purchase(
        newId,
        farmerId,
        storageId,
        new Date(date).toISOString(),
        Number(quantity),
        Number(pricePerKg)
    );

    try {
        storage.addRawFromPurchase(newId, quantity);

        // Update raw products weight
        const rawProducts = fetchRawProducts();
        const weightInGrams = quantity * 1000;

        if (rawProducts.length > 0) {
            const rawProduct = rawProducts.find(p => p.type === ProductType.RAW);
            if (rawProduct) {
                rawProduct.weight += weightInGrams;
            } else {
                rawProducts.push({ weight: weightInGrams, type: ProductType.RAW });
            }
        } else {
            rawProducts.push({ weight: weightInGrams, type: ProductType.RAW });
        }

        // Save all changes
        purchases.push(purchase);
        savePurchases(purchases);
        saveRawProducts(rawProducts);
        saveStorages(storages);

        return purchase;
    } catch (error) {
        throw new Error(`Failed to create purchase: ${error.message}`);
    }
}

// Get all purchases
export function readPurchases() {
    return fetchPurchases();
}

// Get purchases for specific farmer
export function readPurchasesByFarmer(farmerId) {
    const purchases = fetchPurchases();
    return purchases.filter(purchase => purchase.farmerId === farmerId);
}

// Update purchase details and adjust storage if needed
export function updatePurchase(id, updatedData) {
    const { quantity, ...allowedUpdates } = updatedData;

    const purchases = fetchPurchases();
    const index = purchases.findIndex(p => p.id === id);

    if (index === -1) throw new Error('Purchase not found');

    const currentPurchase = purchases[index];

    if (allowedUpdates.storageId && allowedUpdates.storageId !== currentPurchase.storageId) {
        const storages = readStorages().map(s => {
            const storage = new Storage(s.id, s.location, s.name, s.maxCapacity);
            storage.currentCapacity = s.currentCapacity || 0;
            storage.contents = s.contents || { raw: [], processed: [] };
            return storage;
        });

        // Remove from old storage
        const oldStorage = storages.find(s => s.id === currentPurchase.storageId);
        if (oldStorage) {
            oldStorage.removeRawProduct(currentPurchase.id);
        }

        // Add to new storage
        const newStorage = storages.find(s => s.id === allowedUpdates.storageId);
        if (!newStorage) {
            throw new Error('New storage not found');
        }

        // Check new storage capacity
        if (newStorage.currentCapacity + currentPurchase.quantity > newStorage.maxCapacity) {
            throw new Error(`Insufficient capacity in new storage ${newStorage.name}`);
        }

        // Add to new storage
        newStorage.addRawFromPurchase(currentPurchase.id, currentPurchase.quantity);

        // Save storage changes
        saveStorages(storages);
    }

    // Calculate new total cost with updated price if provided
    const pricePerKg = allowedUpdates.pricePerKg || currentPurchase.pricePerKg;
    const totalCost = currentPurchase.quantity * pricePerKg;

    // Update purchase with only allowed fields
    purchases[index] = {
        ...currentPurchase,
        ...allowedUpdates,
        totalCost,
        quantity: currentPurchase.quantity
    };

    savePurchases(purchases);
    return purchases[index];
}

// Delete purchase and update storage/raw materials
export function deletePurchase(id) {
    const purchases = fetchPurchases();
    const purchase = purchases.find(p => p.id === id);

    if (purchase) {
        // Update storage
        const storages = readStorages().map(s => {
            const storage = new Storage(s.id, s.location, s.name, s.maxCapacity);
            storage.currentCapacity = s.currentCapacity || 0;
            storage.contents = s.contents || { raw: [], processed: [] };
            return storage;
        });

        const storage = storages.find(s => s.id === purchase.storageId);
        if (storage) {
            storage.removeRawProduct(purchase.id);
            saveStorages(storages);
        }

        // Convert kg to grams and subtract from raw products
        const weightToRemove = purchase.quantity * 1000;
        const rawProducts = fetchRawProducts();
        const rawProduct = rawProducts.find(p => p.type === ProductType.RAW);

        if (rawProduct) {
            rawProduct.weight -= weightToRemove;
            saveRawProducts(rawProducts);
        }
    }

    const updatedPurchases = purchases.filter(purchase => purchase.id !== id);
    savePurchases(updatedPurchases);
}