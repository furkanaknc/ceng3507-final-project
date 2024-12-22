export const PURCHASE_STORAGE_KEY = "purchases";

// Fetch all purchases from local storage
export function fetchPurchases() {
    const purchases = localStorage.getItem(PURCHASE_STORAGE_KEY);
    return purchases ? JSON.parse(purchases) : [];
}

// Save purchases to local storage
export function savePurchases(purchases) {
    localStorage.setItem(PURCHASE_STORAGE_KEY, JSON.stringify(purchases));
}