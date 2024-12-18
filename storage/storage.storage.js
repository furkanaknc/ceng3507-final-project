export const STORAGE_STORAGE_KEY = "storages";

export function fetchStorages() {
    const storages = localStorage.getItem(STORAGE_STORAGE_KEY);
    return storages ? JSON.parse(storages) : [];
}

export function saveStorages(storages) {
    localStorage.setItem(STORAGE_STORAGE_KEY, JSON.stringify(storages));
}