import { saveProducts, fetchProducts } from "../storage/product.storage.js";
import { Product } from "../class/product.class.js";
import { updateRawProductStorage, checkRawProductAvailability } from "./raw-product.util.js";
import { ProductCategory,CategoryWeights } from "../enum/product-category.enum.js";

export function createProduct(category, price, type, customWeight = null, quantity = 0) {
    if (!category || !price || !type) {
        throw new Error('All fields are required');
    }

    quantity = Math.max(0, Number(quantity) || 0);

    const products = fetchProducts();
    const existingProduct = products.find(p => 
        p.category === category && 
        p.type === type && 
        (category === ProductCategory.PREMIUM ? p.weight === customWeight : true)
    );

    if (existingProduct) {
        throw new Error(`A product with category ${category} and type ${type}${
            category === ProductCategory.PREMIUM ? ` and weight ${customWeight}g` : ''
        } already exists with price $${existingProduct.price}`);
    }

    const unitWeight = category === ProductCategory.PREMIUM ? 
        customWeight : 
        CategoryWeights[category];

    const totalRequiredWeight = unitWeight * Number(quantity);
    const availableRawWeight = checkRawProductAvailability();

    if (availableRawWeight < totalRequiredWeight) {
        const maxPossibleProducts = Math.floor(availableRawWeight / unitWeight);
        throw new Error(`Insufficient raw product. Can only create ${maxPossibleProducts} complete units of ${unitWeight}g each`);
    }

    const newId = products.length ? Math.max(...products.map(p => p.id || 0)) + 1 : 1;
    
    const product = new Product(
        newId, 
        category, 
        Number(price), 
        type, 
        quantity,
        customWeight
    );

    if (totalRequiredWeight > 0) {
        updateRawProductStorage(-totalRequiredWeight);
    }

    products.push(product);
    saveProducts(products);
    
    return product;
}

export function readProducts() {
    return fetchProducts().map(p => 
        new Product(p.id, p.category, p.price, p.type, p.quantity, p.customWeight)
    );
}

export function updateProduct(id, updatedData) {
    const products = fetchProducts();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) throw new Error('Product not found');
    
    const currentProduct = products[index];
    
    const currentWeight = currentProduct.weight * currentProduct.quantity;
    const newWeight = currentProduct.weight * updatedData.quantity;
    const weightDifference = newWeight - currentWeight;
    
    if (weightDifference > 0) {
        const availableRawWeight = checkRawProductAvailability();
        if (availableRawWeight < weightDifference) {
            const possibleIncrease = Math.floor(availableRawWeight / currentProduct.weight);
            throw new Error(`Insufficient raw product. Can only increase by ${possibleIncrease} units`);
        }
    }

    const existingProduct = products.find(p => 
        p.id !== id && 
        p.category === updatedData.category && 
        p.type === updatedData.type && 
        (updatedData.category === ProductCategory.PREMIUM ? 
            p.weight === updatedData.weight : true)
    );

    if (existingProduct) {
        if (existingProduct.price === updatedData.price) {
            updateRawProductStorage(-weightDifference); // Use negative for increase
            
            existingProduct.quantity += currentProduct.quantity;
            products.splice(index, 1);
            saveProducts(products);
            return existingProduct;
        } else {
            throw new Error(
                `Cannot update: A product with same category ${updatedData.category} and type ${updatedData.type} ` +
                `already exists with different price ($${existingProduct.price} vs $${updatedData.price})`
            );
        }
    }

    updateRawProductStorage(-weightDifference); 

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
    const updatedProducts = products.filter(p => p.id !== id);
    saveProducts(updatedProducts);
}