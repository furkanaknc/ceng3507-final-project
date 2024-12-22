import { saveFarmers, fetchFarmers } from "../storage/farmer.storage.js";
import { Farmer } from "../class/farmer.class.js"

// Create new farmer after validating info and checking duplicates
export function createFarmer(name, contact, location) {
    // Check if all required fields are provided
    if (!name?.trim() || 
        !contact?.phone?.trim() || 
        !contact?.email?.trim() || 
        !location?.address?.trim() || 
        !location?.city?.trim()) {
        throw new Error('All fields are required');
    }

    // Check if farmer already exists with same details
    if (isDuplicateFarmer(name, contact)) {
        throw new Error(`A farmer with name "${name}", phone "${contact.phone} and ${contact.email}" already exists`);
    }

    // Get farmers and generate new ID
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

// Get all farmers from storage
export function readFarmers() {
    const farmers = fetchFarmers();
    return farmers;
}

// Update existing farmer details
export function updateFarmer(id, updatedData) {
    const farmers = fetchFarmers();
    const index = farmers.findIndex(farmer => farmer.id === id);
    if (index !== -1) {
        // Merge existing data with updates
        farmers[index] = { ...farmers[index], ...updatedData };
        saveFarmers(farmers);
    } else {
        console.log("Farmer not found!");
    }
}

// Remove farmer from storage
export function deleteFarmer(id) {
    const farmers = fetchFarmers();
    const updatedFarmers = farmers.filter(farmer => farmer.id !== id);
    saveFarmers(updatedFarmers);
}

// Check if farmer exists with same name and contact info
function isDuplicateFarmer(name, contact) {
    const farmers = fetchFarmers();
    return farmers.some(farmer =>
        farmer.name.trim().toLowerCase() === name.trim().toLowerCase() &&
        farmer.contact.phone.trim() === contact.phone.trim() &&
        farmer.contact.email.trim() === contact.email.trim()
    );
}
