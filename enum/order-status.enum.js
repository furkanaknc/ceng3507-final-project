//Javascript doesn't have enum type, so I've used Object.freeze() to create a constant object
// Order processing status tracking
export const OrderStatus = Object.freeze({
    PENDING: 'PENDING',
    PROCESSED: 'PROCESSED',
    SHIPPED: 'SHIPPED',
    DELIVERED: 'DELIVERED'
});