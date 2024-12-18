import { saveStorages, fetchStorages } from "../storage/storage.storage.js";
import { Storage } from "../class/storage.class.js";

export function createStorage(location, name, maxCapacity) {
    const storages = fetchStorages();
    const existingStorage = storages.find(storage => storage.location === location && storage.name === name);

    if (existingStorage) {
        throw new Error('Storage with the same name already exists in this location');
    }

    const newId = storages.length ? Math.max(...storages.map(storage => storage.id)) + 1 : 1;
    const storage = new Storage(newId, location, name, maxCapacity);

    storages.push(storage);
    saveStorages(storages);
    return storage;
}

export function readStorages() {
    const storages = fetchStorages();
    return storages.map(storage => Object.assign(new Storage(), storage));
}

export function updateStorage(id, updatedData) {
    const storages = fetchStorages();
    const index = storages.findIndex(storage => storage.id === id);
    if (index === -1) throw new Error('Storage not found');

    const storage = storages[index];
    const updatedStorage = { ...storage, ...updatedData };

    // Ensure current capacity does not exceed max capacity
    if (updatedStorage.currentCapacity > updatedStorage.maxCapacity) {
        throw new Error('Current capacity exceeds the new max capacity');
    }

    storages[index] = updatedStorage;
    saveStorages(storages);
    return updatedStorage;
}

export function updateStorageCapacity(id, capacityChange) {
    const storages = fetchStorages();
    const storage = storages.find(s => s.id === id);
    if (!storage) throw new Error('Storage not found');

    const storageInstance = Object.assign(new Storage(), storage);
    const newCapacity = storageInstance.currentCapacity + capacityChange;
    
    if (newCapacity < 0 || newCapacity > storageInstance.maxCapacity) {
        throw new Error('Capacity change exceeds storage limits');
    }

    storageInstance.currentCapacity = newCapacity;
    const updatedStorages = storages.map(s => 
        s.id === id ? storageInstance : s
    );
    
    saveStorages(updatedStorages);
    return storageInstance;
}

export function deleteStorage(id) {
    const storages = fetchStorages();
    const updatedStorages = storages.filter(storage => storage.id !== id);
    saveStorages(updatedStorages);
}