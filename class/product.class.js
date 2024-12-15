import { ProductType } from "../enum/product-types.enum.js";
import { ProductCategory, CategoryWeights } from "../enum/product-category.enum.js";

export class Product {
    constructor(id, category, price, type = ProductType.FRESH, quantity = 0,customWeight = null) {
        this.id = id;
        this.category = category;
        this.price = price;
        this.type = type;
        this.quantity = Number(quantity);
        this.customWeight = customWeight; 
        this.weight = category === ProductCategory.PREMIUM ? 
            customWeight : 
            CategoryWeights[category];
    }

    getFormattedPrice() {
        return this.price.toFixed(2);
    }

    
    getTotalWeight() {
        return (this.quantity * this.weight) / 1000; // Convert g to kg
    }

    getStockStatus() {
        if (this.quantity <= 100) {
            return 'low';
        } else if (this.quantity <= 250) {
            return 'medium';
        }
        return 'high';
    }

    getStatusColor() {
        const status = this.getStockStatus();
        return {
            low: '#e74c3c',
            medium: '#f1c40f', 
            high: '#2ecc71'
        }[status];
    }
}