import { saveRawProducts, fetchRawProducts } from "../storage/raw-product.storage.js";
import { ProductType } from "../enum/product-types.enum.js";

// Get total raw material weight from all storages
export function checkRawProductAvailability() {
    const rawProducts = fetchRawProducts();
    const totalRawWeight = rawProducts.reduce((sum, product) => {
        if (product.type === ProductType.RAW) {
            return sum + product.weight;
        }
        return sum;
    }, 0);
    
    return totalRawWeight; 
}

// Update raw material weight (increase/decrease) and manage storage
export function updateRawProductStorage(weightChange) {
    // Get current raw products
    const rawProducts = fetchRawProducts();
    let remainingChange = Math.abs(weightChange);
    const isDecrease = weightChange < 0;

    // Update weights based on operation type
    const updatedRawProducts = rawProducts.map(product => {
        if (product.type === ProductType.RAW && remainingChange > 0) {
            if (isDecrease) {
                // Remove weight if decreasing
                if (product.weight <= remainingChange) {
                    remainingChange -= product.weight;
                    return null;
                } else {
                    product.weight -= remainingChange;
                    remainingChange = 0;
                    return product;
                }
            } else {
                product.weight += remainingChange;
                remainingChange = 0;
                return product;
            }
        }
        return product;
    }).filter(Boolean);

    saveRawProducts(updatedRawProducts);
}

