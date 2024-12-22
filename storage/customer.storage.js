export const CUSTOMER_STORAGE_KEY = "customers";

// Fetch all customers from local storage
export function fetchCustomers() {
    const customers = localStorage.getItem(CUSTOMER_STORAGE_KEY);
    return customers ? JSON.parse(customers) : [];
}

// Save customers to local storage
export function saveCustomers(customers) {
    localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customers));
}