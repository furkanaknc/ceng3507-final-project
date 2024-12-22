export const STORAGE_STORAGE_KEY = "storages";

// Fetch all storages from local storage
export function fetchStorages() {
    const storages = localStorage.getItem(STORAGE_STORAGE_KEY);
    return storages ? JSON.parse(storages) : [];
}

// Save storages to local storage
export function saveStorages(storages) {
    localStorage.setItem(STORAGE_STORAGE_KEY, JSON.stringify(storages));
}