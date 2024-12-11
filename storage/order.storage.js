export const ORDER_STORAGE_KEY = "orders";

export function fetchOrders() {
    const orders = localStorage.getItem(ORDER_STORAGE_KEY);
    return orders ? JSON.parse(orders) : [];
}

export function saveOrders(orders) {
    localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
}