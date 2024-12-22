import { saveCustomers, fetchCustomers } from "../storage/customer.storage.js";
import { Customer } from "../class/customer.class.js";

// Create a new customer if not already exists
export function createCustomer(name, contact, address) {
    // Get existing customers from storage
    const customers = fetchCustomers();
    
    // Check if customer already exists with same name and phone
    if (isDuplicateCustomer(name, contact)) {
        throw new Error('Customer with same name and contact already exists');
    }

    // Generate new ID (max current ID + 1, or 1 if no customers)
    const newId = customers.length ? Math.max(...customers.map(c => c.id)) + 1 : 1;
    
    // Create new customer instance
    const customer = new Customer(newId, name, contact, address);

    customers.push(customer);
    saveCustomers(customers);
    return customer;
}

// Get all customers from storage
export function readCustomers() {
    return fetchCustomers();
}

// Update existing customer details
export function updateCustomer(id, updatedData) {
    const customers = fetchCustomers();
    const index = customers.findIndex(c => c.id === id);
    
    if (index === -1) throw new Error('Customer not found');

    customers[index] = {
        ...customers[index],
        ...updatedData
    };

    saveCustomers(customers);
    return customers[index];
}

// Remove customer from storage
export function deleteCustomer(id) {
    const customers = fetchCustomers();
    const updatedCustomers = customers.filter(c => c.id !== id);
    saveCustomers(updatedCustomers);
}

// Check if customer exists with same name and phone
function isDuplicateCustomer(name, contact) {
    const customers = fetchCustomers();
    return customers.some(c => 
        c.name.toLowerCase() === name.toLowerCase() &&
        c.contact.phone === contact.phone
    );
}