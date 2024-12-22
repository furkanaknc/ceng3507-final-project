export const RAW_PRODUCT_STORAGE_KEY = "raw_products"; 

//this storage is about when we purchase product from farmers
//we are adding all purchases as a raw product and merge them in every purchase

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