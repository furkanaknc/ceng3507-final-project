export const PRODUCT_STORAGE_KEY = "processed_products"; // Change this

export function fetchProducts() {
    const products = localStorage.getItem(PRODUCT_STORAGE_KEY);
    return products ? JSON.parse(products) : [];
}

export function saveProducts(packages) {
    localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(packages));
}