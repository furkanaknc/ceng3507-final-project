export const CUSTOMER_STORAGE_KEY = "customers";

export function fetchCustomers() {
    const customers = localStorage.getItem(CUSTOMER_STORAGE_KEY);
    return customers ? JSON.parse(customers) : [];
}

export function saveCustomers(customers) {
    localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customers));
}