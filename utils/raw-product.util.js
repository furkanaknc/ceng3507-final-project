import { saveRawProducts, fetchRawProducts } from "../storage/raw-product.storage.js";
import { ProductType } from "../enum/product-types.enum.js";

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

export function updateRawProductStorage(weightChange) {
    const rawProducts = fetchRawProducts();
    let remainingChange = Math.abs(weightChange);
    const isDecrease = weightChange < 0;

    console.log('Updating raw product storage:', {
        weightChange,
        currentRawProducts: rawProducts
    });

    const updatedRawProducts = rawProducts.map(product => {
        if (product.type === ProductType.RAW && remainingChange > 0) {
            if (isDecrease) {
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

    console.log('Updated raw products:', updatedRawProducts);
    saveRawProducts(updatedRawProducts);
}

