export const PRODUCT_STORAGE_KEY = "processed_products"; // Change this

// Fetch all products from local storage
export function fetchProducts() {
    const products = localStorage.getItem(PRODUCT_STORAGE_KEY);
    return products ? JSON.parse(products) : [];
}

// Save products to local storage
export function saveProducts(packages) {
    localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(packages));
}