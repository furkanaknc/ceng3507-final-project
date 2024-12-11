import { saveFarmers, fetchFarmers } from "../storage/farmer.storage.js";
import { Farmer } from "../class/farmer.class.js"

export function createFarmer(name, contact, location) {
    if (!name?.trim() || 
        !contact?.phone?.trim() || 
        !contact?.email?.trim() || 
        !location?.address?.trim() || 
        !location?.city?.trim()) {
        throw new Error('All fields are required');
    }

    if (isDuplicateFarmer(name, contact)) {
        throw new Error(`A farmer with name "${name}", phone "${contact.phone} and ${contact.email}" already exists`);
    }

    const farmers = fetchFarmers();
    const newId = farmers.length ? Math.max(...farmers.map(f => f.id)) + 1 : 1;

    const farmer = new Farmer(
        newId,
        name.trim(),
        {
            phone: contact.phone.trim(),
            email: contact.email.trim()
        },
        {
            address: location.address.trim(),
            city: location.city.trim()
        }
    );

    farmers.push(farmer);
    saveFarmers(farmers);
    return farmer;
}


export function readFarmers() {
    const farmers = fetchFarmers();
    return farmers;
}


export function updateFarmer(id, updatedData) {
    const farmers = fetchFarmers();
    const index = farmers.findIndex(farmer => farmer.id === id);
    if (index !== -1) {
        farmers[index] = { ...farmers[index], ...updatedData };
        saveFarmers(farmers);
        console.log("Farmer updated successfully:", farmers[index]);
    } else {
        console.log("Farmer not found!");
    }
}


export function deleteFarmer(id) {
    const farmers = fetchFarmers();
    const updatedFarmers = farmers.filter(farmer => farmer.id !== id);
    saveFarmers(updatedFarmers);
    console.log("Farmer deleted successfully:", id);
}


function isDuplicateFarmer(name, contact) {
    const farmers = fetchFarmers();
    return farmers.some(farmer =>
        farmer.name.trim().toLowerCase() === name.trim().toLowerCase() &&
        farmer.contact.phone.trim() === contact.phone.trim() &&
        farmer.contact.email.trim() === contact.email.trim()
    );
}
