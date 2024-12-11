import { savePurchases, fetchPurchases } from "../storage/purchase.storage.js";
import { Purchase } from "../class/purchase.class.js";
import { readFarmers } from "./farmer.util.js";
import { saveRawProducts, fetchRawProducts } from "../storage/raw-product.storage.js";
import { ProductType } from "../enum/product-types.enum.js";

export function createPurchase(farmerId, date, quantity, pricePerKg) {
    console.log('Creating purchase with:', { farmerId, date, quantity, pricePerKg });

    if (!farmerId) {
        throw new Error('Farmer is required');
    }
    if (!date) {
        throw new Error('Date is required');
    }
    if (!quantity || quantity <= 0) {
        throw new Error('Valid quantity is required');
    }
    if (!pricePerKg || pricePerKg <= 0) {
        throw new Error('Valid price per kg is required');
    }

    const farmers = readFarmers();
    const farmerExists = farmers.some(farmer => farmer.id === farmerId);
    if (!farmerExists) {
        throw new Error('Invalid farmer ID');
    }

    const purchases = fetchPurchases();
    const newId = purchases.length ? Math.max(...purchases.map(p => p.id)) + 1 : 1;

    const purchase = new Purchase(
        newId,
        farmerId,
        new Date(date).toISOString(),
        Number(quantity),
        Number(pricePerKg)
    );

    const rawProducts = fetchRawProducts();
    const weightInGrams = quantity * 1000;

    if (rawProducts.length > 0) {
        const rawProduct = rawProducts.find(p => p.type === ProductType.RAW);
        if (rawProduct) {
            rawProduct.weight += weightInGrams;
        } else {
            rawProducts.push({
                weight: weightInGrams,
                type: ProductType.RAW
            });
        }
    } else {
        rawProducts.push({
            weight: weightInGrams,
            type: ProductType.RAW
        });
    }

    purchases.push(purchase);
    
    savePurchases(purchases);
    saveRawProducts(rawProducts);
    
    return purchase;
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
    
    if (index !== -1) {
        const quantity = updatedData.quantity || purchases[index].quantity;
        const pricePerKg = updatedData.pricePerKg || purchases[index].pricePerKg;
        const totalCost = quantity * pricePerKg;
        
        purchases[index] = { 
            ...purchases[index], 
            ...updatedData,
            totalCost
        };
        
        savePurchases(purchases);
        console.log("Purchase updated successfully:", purchases[index]);
        return purchases[index];
    }
    throw new Error("Purchase not found!");
}

export function deletePurchase(id) {
    const purchases = fetchPurchases();
    const updatedPurchases = purchases.filter(purchase => purchase.id !== id);
    savePurchases(updatedPurchases);
    console.log("Purchase deleted successfully:", id);
}