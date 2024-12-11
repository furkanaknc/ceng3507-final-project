export const PURCHASE_STORAGE_KEY = "purchases";

export function fetchPurchases() {
    const purchases = localStorage.getItem(PURCHASE_STORAGE_KEY);
    return purchases ? JSON.parse(purchases) : [];
}

export function savePurchases(purchases) {
    localStorage.setItem(PURCHASE_STORAGE_KEY, JSON.stringify(purchases));
}