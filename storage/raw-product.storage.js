export const RAW_PRODUCT_STORAGE_KEY = "raw_products"; 

export function fetchRawProducts() {
    const rawProducts = localStorage.getItem(RAW_PRODUCT_STORAGE_KEY);
    return rawProducts ? JSON.parse(rawProducts) : [];
}

export function readRawProducts() {
    const rawProducts = localStorage.getItem('raw_products');
    return rawProducts ? JSON.parse(rawProducts) : [];
}

export function saveRawProducts(rawProducts) {
    localStorage.setItem(RAW_PRODUCT_STORAGE_KEY, JSON.stringify(rawProducts));
}