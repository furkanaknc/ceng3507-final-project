export const INVENTORY_STORAGE_KEY = "inventory";

export function fetchInventory() {
    const inventory = localStorage.getItem(INVENTORY_STORAGE_KEY);
    return inventory ? JSON.parse(inventory) : [];
}

export function saveInventory(inventory) {
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inventory));
}