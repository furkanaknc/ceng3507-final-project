import { saveCustomers, fetchCustomers } from "../storage/customer.storage.js";
import { Customer } from "../class/customer.class.js";

export function createCustomer(name, contact, address) {
    const customers = fetchCustomers();
    
    if (isDuplicateCustomer(name, contact)) {
        throw new Error('Customer with same name and contact already exists');
    }

    const newId = customers.length ? Math.max(...customers.map(c => c.id)) + 1 : 1;
    const customer = new Customer(newId, name, contact, address);

    customers.push(customer);
    saveCustomers(customers);
    return customer;
}

export function readCustomers() {
    return fetchCustomers();
}

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

export function deleteCustomer(id) {
    const customers = fetchCustomers();
    const updatedCustomers = customers.filter(c => c.id !== id);
    saveCustomers(updatedCustomers);
}

function isDuplicateCustomer(name, contact) {
    const customers = fetchCustomers();
    return customers.some(c => 
        c.name.toLowerCase() === name.toLowerCase() &&
        c.contact.phone === contact.phone
    );
}