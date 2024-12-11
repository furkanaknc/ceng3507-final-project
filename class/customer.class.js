export class Customer {
    constructor(id, name, contact, address) {
        this.id = id;
        this.name = name;
        this.contact = {
            phone: contact.phone || '',
            email: contact.email || ''
        };
        this.address = {
            street: address.street || '',
            city: address.city || '',
            postalCode: address.postalCode || ''
        };
        this.orders = []; 
    }
}