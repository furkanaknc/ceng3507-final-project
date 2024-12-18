import { savePurchases, fetchPurchases } from "../storage/purchase.storage.js";
import { Purchase } from "../class/purchase.class.js";
import { readFarmers } from "./farmer.util.js";
import { saveRawProducts, fetchRawProducts } from "../storage/raw-product.storage.js";
import { ProductType } from "../enum/product-types.enum.js";
import { fetchStorages } from "../storage/storage.storage.js";
import { Storage } from "../class/storage.class.js";
import { saveStorages } from "../storage/storage.storage.js";

export function createPurchase(farmerId, storageId, date, quantity, pricePerKg) {

    if (!farmerId) throw new Error('Farmer is required');
    if (!storageId) throw new Error('Storage is required');
    if (!date) throw new Error('Date is required');
    if (!quantity || quantity <= 0) throw new Error('Valid quantity is required');
    if (!pricePerKg || pricePerKg <= 0) throw new Error('Valid price per kg is required');


    const farmers = readFarmers();

    const farmerExists = farmers.some(farmer => farmer.id === farmerId);
    if (!farmerExists) {
        throw new Error('Invalid farmer ID');
    }

    const storages = fetchStorages().map(s => Object.assign(new Storage(), s));
    const storage = storages.find(s => s.id === storageId);
    if (!storage) throw new Error('Storage not found');

    const availableCapacity = storage.maxCapacity - storage.currentCapacity;
    if (quantity > availableCapacity) {
        throw new Error(`Insufficient storage capacity. Only ${availableCapacity}kg available in ${storage.name}`);
    }


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

export function readPurchases() {
    return fetchPurchases();
}

export function readPurchasesByFarmer(farmerId) {
    const purchases = fetchPurchases();
    return purchases.filter(purchase => purchase.farmerId === farmerId);
}

export function updatePurchase(id, updatedData) {
    const purchases = fetchPurchases();
    const index = purchases.findIndex(purchase => purchase.id === id);

    if (index === -1) {
        throw new Error("Purchase not found!");
    }

    // Store original quantity for comparison
    const originalQuantity = purchases[index].quantity;
    const newQuantity = updatedData.quantity || originalQuantity;

    // Calculate weight difference in grams
    const weightDifferenceGrams = (newQuantity - originalQuantity) * 1000;

    // Update raw products storage
    const rawProducts = fetchRawProducts();
    const rawProduct = rawProducts.find(p => p.type === ProductType.RAW);

    if (rawProduct) {
        rawProduct.weight += weightDifferenceGrams;
        saveRawProducts(rawProducts);
    }

    // Update purchase
    const pricePerKg = updatedData.pricePerKg || purchases[index].pricePerKg;
    const totalCost = newQuantity * pricePerKg;

    purchases[index] = {
        ...purchases[index],
        ...updatedData,
        totalCost
    };

    savePurchases(purchases);
    return purchases[index];
}

export function deletePurchase(id) {
    const purchases = fetchPurchases();
    const purchase = purchases.find(p => p.id === id);

    if (purchase) {
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