import { saveProducts, fetchProducts } from "../storage/product.storage.js";
import { Product } from "../class/product.class.js";
import { updateRawProductStorage, checkRawProductAvailability } from "./raw-product.util.js";
import { ProductCategory, CategoryWeights } from "../enum/product-category.enum.js";
import { readStorages } from "./storage.util.js";
import { Storage } from "../class/storage.class.js";
import { saveStorages } from "../storage/storage.storage.js";

export function createProduct(category, price, type, storageId, customWeight = null, quantity = 0) {
    console.log('category:',category,'price:', price, 'type:',type, 'storageId:',storageId, 'customWeight:',customWeight, 'quantity:',quantity);
    
    if (!category || !price || !type || !storageId) {
        throw new Error('All fields are required');
    }

    quantity = Number(quantity);
    if (isNaN(quantity) || quantity < 0) {
        throw new Error('Quantity must be a valid positive number');
    }

    const products = fetchProducts();
    const existingProduct = products.find(p =>
        p.category === category &&
        p.type === type &&
        (category === ProductCategory.PREMIUM ? p.weight === customWeight : true)
    );

    if (existingProduct) {
        throw new Error(`Product already exists`);
    }

    // Calculate required weight
    const unitWeight = category === ProductCategory.PREMIUM ?
        customWeight :
        CategoryWeights[category];
    const totalRequiredWeight = unitWeight * quantity;

    // Get all storages and convert to Storage instances
    const storages = readStorages().map(s => {
        const storage = new Storage(s.id, s.location, s.name, s.maxCapacity);
        storage.currentCapacity = s.currentCapacity || 0;
        storage.contents = s.contents || { raw: [], processed: [] };
        return storage;
    });

    // Check target storage capacity
    const targetStorage = storages.find(s => s.id === storageId);
    if (!targetStorage) {
        throw new Error('Target storage not found');
    }

    if (targetStorage.currentCapacity + (totalRequiredWeight / 1000) > targetStorage.maxCapacity) {
        throw new Error(`Insufficient storage capacity in ${targetStorage.name}`);
    }

    // Calculate total available raw materials from all storages
    let totalRawAvailable = 0;
    const storageContents = storages.map(storage => ({
        storage,
        rawContents: storage.contents.raw
    }));

    for (const { rawContents } of storageContents) {
        totalRawAvailable += rawContents.reduce((sum, item) => sum + item.quantity, 0);
    }

    if (totalRawAvailable * 1000 < totalRequiredWeight) {
        throw new Error(`Insufficient raw materials. Available: ${totalRawAvailable}kg, Required: ${totalRequiredWeight / 1000}kg`);
    }

    // Create new product
    const newId = products.length ? Math.max(...products.map(p => p.id || 0)) + 1 : 1;
    const product = new Product(
        newId,
        category,
        Number(price),
        type,
        quantity,
        customWeight,
        storageId
    );

    // Deduct raw materials from storages
    let remainingToDeduct = totalRequiredWeight / 1000; // Convert to kg
    for (const { storage, rawContents } of storageContents) {
        if (remainingToDeduct <= 0) break;

        for (let i = 0; i < rawContents.length && remainingToDeduct > 0; i++) {
            const available = rawContents[i].quantity;
            const deduct = Math.min(available, remainingToDeduct);
            rawContents[i].quantity -= deduct;
            remainingToDeduct -= deduct;
            storage.currentCapacity -= deduct;

            if (rawContents[i].quantity <= 0) {
                storage.contents.raw.splice(i, 1);
                i--;
            }
        }
    }

    // Add to target storage's processed contents
    targetStorage.addProcessedProduct(newId, quantity, totalRequiredWeight / 1000);

    // Save all changes
    saveStorages(storages);
    updateRawProductStorage(-totalRequiredWeight);
    products.push(product);
    saveProducts(products);

    return product;
}

export function readProducts() {
    return fetchProducts().map(p =>
        new Product(p.id, p.category, p.price, p.type, p.quantity, p.customWeight, p.storageId)
    );
}

export function updateProduct(id, updatedData) {
    if ('quantity' in updatedData) {
        updatedData.quantity = Number(updatedData.quantity);
        if (isNaN(updatedData.quantity) || updatedData.quantity < 0) {
            throw new Error('Quantity must be a valid positive number');
        }
    }

    const products = fetchProducts();
    const index = products.findIndex(p => p.id === id);

    if (index === -1) throw new Error('Product not found');

    const currentProduct = products[index];

    // Calculate weight changes
    const currentWeight = currentProduct.weight * currentProduct.quantity;
    const newWeight = (updatedData.weight || currentProduct.weight) * updatedData.quantity;
    const weightDifference = newWeight - currentWeight;

    // Get storages
    const storages = readStorages().map(s => {
        const storage = new Storage(s.id, s.location, s.name, s.maxCapacity);
        storage.currentCapacity = s.currentCapacity || 0;
        storage.contents = s.contents || { raw: [], processed: [] };
        return storage;
    });

    // Handle storage changes if storage is being updated
    if (updatedData.storageId && updatedData.storageId !== currentProduct.storageId) {
        // Remove from old storage
        const oldStorage = storages.find(s => s.id === currentProduct.storageId);
        if (oldStorage) {
            oldStorage.removeProcessedProduct(currentProduct.id);
        }

        // Add to new storage
        const newStorage = storages.find(s => s.id === updatedData.storageId);
        if (!newStorage) {
            throw new Error('New storage not found');
        }

        // Check new storage capacity
        if (newStorage.currentCapacity + (newWeight / 1000) > newStorage.maxCapacity) {
            throw new Error(`Insufficient capacity in new storage ${newStorage.name}`);
        }

        // Add to new storage
        newStorage.addProcessedProduct(
            currentProduct.id,
            updatedData.quantity,
            newWeight / 1000
        );
    } else {
        // Update existing storage
        const storage = storages.find(s => s.id === currentProduct.storageId);
        if (storage) {
            storage.removeProcessedProduct(currentProduct.id);
            storage.addProcessedProduct(
                currentProduct.id,
                updatedData.quantity,
                newWeight / 1000
            );
        }
    }

    // Save storage changes
    saveStorages(storages);

    // Update raw product storage if needed
    if (weightDifference > 0) {
        const availableRawWeight = checkRawProductAvailability();
        if (availableRawWeight < weightDifference) {
            throw new Error(`Insufficient raw product for this update`);
        }
        updateRawProductStorage(-weightDifference);
    } else if (weightDifference < 0) {
        updateRawProductStorage(Math.abs(weightDifference));
    }

    // Update product
    const updatedProduct = {
        ...currentProduct,
        ...updatedData
    };

    products[index] = updatedProduct;
    saveProducts(products);
    return updatedProduct;
}

export function updateProductStock(id, quantityChange) {
    const products = fetchProducts();
    const index = products.findIndex(p => p.id === id);

    if (index === -1) throw new Error('Product not found');

    const currentProduct = products[index];
    const newQuantity = currentProduct.quantity + quantityChange;

    // Prevent negative quantity
    if (newQuantity < 0) {
        throw new Error(`Insufficient stock. Only ${currentProduct.quantity} units available.`);
    }

    // Update weight in raw products if needed
    const weightDifference = quantityChange * currentProduct.weight;
    if (weightDifference > 0) {
        const availableRaw = checkRawProductAvailability();
        if (availableRaw < weightDifference) {
            throw new Error('Insufficient raw product for this quantity increase');
        }
        updateRawProductStorage(-weightDifference);
    }

    currentProduct.quantity = newQuantity;
    products[index] = currentProduct;
    saveProducts(products);

    return currentProduct;
}

export function deleteProduct(id) {
    const products = fetchProducts();
    const product = products.find(p => p.id === id);

    if (!product) {
        throw new Error('Product not found');
    }

    // Get storage and remove product
    const storages = readStorages().map(s => {
        const storage = new Storage(s.id, s.location, s.name, s.maxCapacity);
        storage.currentCapacity = s.currentCapacity || 0;
        storage.contents = s.contents || { raw: [], processed: [] };
        return storage;
    });

    const targetStorage = storages.find(s => s.id === product.storageId);
    if (targetStorage) {
        targetStorage.removeProcessedProduct(id);
        saveStorages(storages);
    }

    // Remove product from products list
    const updatedProducts = products.filter(p => p.id !== id);
    saveProducts(updatedProducts);

    // Return raw materials to storage
    const totalWeight = product.weight * product.quantity;
    updateRawProductStorage(totalWeight);
}