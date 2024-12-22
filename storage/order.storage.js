export const ORDER_STORAGE_KEY = "orders";

// Fetch all orders from local storage
export function fetchOrders() {
    const orders = localStorage.getItem(ORDER_STORAGE_KEY);
    return orders ? JSON.parse(orders) : [];
}

// Save orders to local storage
export function saveOrders(orders) {
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
}