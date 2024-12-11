import { createOrder, updateOrder, getOrdersByStatus, calculateRevenue, deleteOrder} from '../../utils/order.util.js';
import { OrderStatus } from '../../enum/order-status.enum.js';
import { ViewManager } from '../../utils/view-manager.util.js';
import { fetchOrders } from '../../storage/order.storage.js';
import { readCustomers } from '../../utils/customer.util.js';
import { readProducts } from '../../utils/product.util.js';

function getCustomerOptions() {
    const customers = readCustomers();
    return customers.map(customer =>
        `<option value="${customer.id}">${customer.name}</option>`
    ).join('');
}

function getProductOptions() {
    const products = readProducts();
    return products.map(product =>
        `<option value="${product.id}" 
            data-category="${product.category}"
            data-price="${product.price}">
            ${product.category} - $${product.getFormattedPrice()}
        </option>`
    ).join('');
}

export function createOrderScreen() {
    const mainContent = document.querySelector('.main-content');
    const orderScreen = document.createElement('div');
    orderScreen.id = 'orderScreen';

    orderScreen.innerHTML = `
        <h1>Order Management</h1>
        
        <!-- Create Order Form -->
        <form id="orderForm">
            <select id="customerId" required>
                <option value="">Select Customer</option>
                ${getCustomerOptions()}
            </select>
            <select id="productId" required>
                <option value="">Select Product</option>
                ${getProductOptions()}
            </select>
            <input type="number" id="quantity" placeholder="Quantity" required min="1">
            <div id="pricePreview">
                <p>Unit Price: $<span id="unitPrice">0.00</span></p>
                <p>Total Price: $<span id="totalPrice">0.00</span></p>
            </div>
            <button type="submit">Create Order</button>
        </form>

        <!-- Order Filters -->
        <div class="filters">
            <select id="statusFilter">
                <option value="">All Statuses</option>
                ${Object.entries(OrderStatus)
            .map(([key, value]) => `<option value="${value}">${key}</option>`)
            .join('')}
            </select>
            <input type="text" id="customerSearch" placeholder="Search by customer">
            <input type="date" id="startDate" placeholder="Start Date">
            <input type="date" id="endDate" placeholder="End Date">
        </div>

        <!-- Revenue Summary -->
        <div class="revenue-summary">
            <h2>Revenue Summary</h2>
            <div id="revenueDisplay"></div>
        </div>

        <!-- Order List -->
        <div id="orderList"></div>

        <!-- Update Modal -->
        <div id="updateOrderModal" class="modal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Update Order</h2>
                <form id="updateOrderForm">
                    <input type="hidden" id="updateId">
                    <select id="updateStatus" required>
                        <option value="">Select Status</option>
                        ${Object.entries(OrderStatus)
            .map(([key, value]) => `<option value="${value}">${key}</option>`)
            .join('')}
                    </select>
                    <input type="number" id="updateQuantity" placeholder="Quantity" required min="1">
                    <div id="updatePricePreview">
                        <p>Unit Price: $<span id="updateUnitPrice">0.00</span></p>
                        <p>Total Price: $<span id="updateTotalPrice">0.00</span></p>
                    </div>
                    <button type="submit">Update Order</button>
                </form>
            </div>
        </div>
    `;

    mainContent.appendChild(orderScreen);
    setTimeout(() => {
        initOrderFormListener();
        initPriceCalculation();
        initFilterListeners();
        initUpdateOrderFormListener();
        initOrderModalClose();
        displayOrders();
        updateRevenueSummary();
    }, 0);
}

function initPriceCalculation() {
    const productSelect = document.getElementById('productId');
    const quantityInput = document.getElementById('quantity');
    const unitPriceSpan = document.getElementById('unitPrice');
    const totalPriceSpan = document.getElementById('totalPrice');

    if (!productSelect || !quantityInput || !unitPriceSpan || !totalPriceSpan) {
        console.error('Price calculation elements not found');
        return;
    }

    function updatePrices() {
        const selectedOption = productSelect.selectedOptions[0];
        const price = selectedOption ? Number(selectedOption.dataset.price) : 0;
        const quantity = Number(quantityInput.value) || 0;

        unitPriceSpan.textContent = price.toFixed(2);
        totalPriceSpan.textContent = (price * quantity).toFixed(2);
    }

    productSelect.addEventListener('change', updatePrices);
    quantityInput.addEventListener('input', updatePrices);
    updatePrices();
}

function initOrderFormListener() {
    document.getElementById('orderForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const productId = Number(document.getElementById('productId').value);
            const customerId = Number(document.getElementById('customerId').value);
            const quantity = Number(document.getElementById('quantity').value);

            const order = createOrder(
                customerId,
                productId,
                quantity
            );

            if (order) {
                e.target.reset();

                document.getElementById('unitPrice').textContent = '0.00';
                document.getElementById('totalPrice').textContent = '0.00';

                showMessage(
                    `Order #${order.id} created successfully. Total: $${order.totalPrice.toFixed(2)}`,
                    'success'
                );

                displayOrders();
                updateRevenueSummary();
            }
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });
}

function initFilterListeners() {
    const filters = ['statusFilter', 'customerSearch', 'startDate', 'endDate'];
    filters.forEach(id => {
        document.getElementById(id).addEventListener('change', () => {
            displayOrders();
            updateRevenueSummary();
        });
    });
}

function fillUpdateForm(order) {
    document.getElementById('updateId').value = order.id;
    document.getElementById('updateStatus').value = order.status;
    document.getElementById('updateQuantity').value = order.quantity;
    document.getElementById('updateUnitPrice').textContent = order.unitPrice.toFixed(2);
    document.getElementById('updateTotalPrice').textContent = order.totalPrice.toFixed(2);
}

function initUpdateOrderFormListener() {
    const updateOrderForm = document.getElementById('updateOrderForm');
    if (!updateOrderForm) {
        console.error('Update order form not found');
        return;
    }

    updateOrderForm.addEventListener('submit', e => {
        e.preventDefault();
        try {
            const id = Number(document.getElementById('updateId').value);
            const status = document.getElementById('updateStatus').value;
            const quantity = Number(document.getElementById('updateQuantity').value);

            const updatedOrder = updateOrder(id, {
                status,
                quantity
            });

            if (updatedOrder) {
                closeModal('updateOrderModal');
                displayOrders();
                updateRevenueSummary();
                showMessage('Order updated successfully', 'success');
            }
        } catch (error) {
            console.error('Error updating order:', error); // Debug log
            showMessage(error.message, 'error');
        }
    });
}

function updateRevenueSummary() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const revenue = calculateRevenue(startDate, endDate);

    document.getElementById('revenueDisplay').innerHTML = `
        <p>Total Revenue: $${revenue.toFixed(2)}</p>
        <p>Period: ${startDate || 'All time'} - ${endDate || 'Present'}</p>
    `;
}

function displayOrders() {
    const status = document.getElementById('statusFilter').value;
    const customerSearch = document.getElementById('customerSearch').value;
    let orders = status ? getOrdersByStatus(status) : fetchOrders();
    const customers = readCustomers();

    if (customerSearch) {
        orders = orders.filter(order => {
            const customer = customers.find(c => c.id === order.customerId);
            return customer?.name.toLowerCase().includes(customerSearch.toLowerCase());
        });
    }

    const orderList = document.getElementById('orderList');
    orderList.innerHTML = orders.map(order => {
        const customer = customers.find(c => c.id === order.customerId);
        return `
            <div class="order-card" data-order-id="${order.id}">
                <h3>Order #${order.id}</h3>
                <p>
                    <strong>Customer:</strong> ${customer?.name || 'Unknown'}<br>
                    <strong>Contact:</strong> ${customer?.contact.phone || 'N/A'}<br>
                    <strong>Product:</strong> ${order.productCategory}<br>
                    <strong>Quantity:</strong> ${order.quantity}<br>
                    <strong>Unit Price:</strong> $${order.unitPrice.toFixed(2)}<br>
                    <strong>Total:</strong> $${order.totalPrice.toFixed(2)}<br>
                    <strong>Status:</strong> ${order.status}
                </p>
                <div class="button-group">
                    <button class="update-btn">Update</button>
                    <button class="delete-btn">Delete</button>
                </div>
            </div>
        `;
    }).join('');

    document.querySelectorAll('.update-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const orderId = Number(e.target.closest('.order-card').dataset.orderId);
            const order = orders.find(o => o.id === orderId);
            if (order) {
                fillUpdateForm(order);
                document.getElementById('updateOrderModal').style.display = 'block';
            }
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            const orderId = Number(e.target.closest('.order-card').dataset.orderId);
            try {
                deleteOrder(orderId);
                displayOrders();
                updateRevenueSummary();
                showMessage('Order deleted successfully', 'success');
            } catch (error) {
                showMessage(error.message, 'error');
            }
        });
    });
}

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;

    const form = document.getElementById('orderForm');
    form.insertAdjacentElement('beforebegin', messageDiv);

    setTimeout(() => messageDiv.remove(), 3000);
}

function initOrderModalClose() {
    const modal = document.getElementById('updateOrderModal');
    const closeBtn = modal.querySelector('.close');

    closeBtn.onclick = () => closeModal('updateOrderModal');
    window.onclick = (e) => {
        if (e.target === modal) {
            closeModal('updateOrderModal');
        }
    };
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

export function showOrderScreen() {
    if (!document.getElementById('orderScreen')) {
        createOrderScreen();
    }
    ViewManager.showScreen('orderScreen');
}