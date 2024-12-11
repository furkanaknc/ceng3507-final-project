export class Farmer {
    constructor(id, name, contact, location) {
        this.id = id;
        this.name = name;
        this.contact = {
            phone: contact.phone || '',
            email: contact.email || ''
        };
        this.location = {
            address: location.address || '',
            city: location.city || ''
        };
    }
}
