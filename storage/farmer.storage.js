export const FARMER_STORAGE_KEY = "farmers";

// Fetch all farmers from local storage
export function fetchFarmers() {
    const farmers = localStorage.getItem(FARMER_STORAGE_KEY);
    return farmers ? JSON.parse(farmers) : [];
}

// Save farmers to local storage
export function saveFarmers(farmers) {
    localStorage.setItem(FARMER_STORAGE_KEY, JSON.stringify(farmers));
}
