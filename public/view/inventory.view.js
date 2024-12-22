import { readStorages } from '../../utils/storage.util.js';
import { ViewManager } from '../../utils/view-manager.util.js';
import { ProductType } from '../../enum/product-types.enum.js';
import { readProducts } from '../../utils/product.util.js';
import { readOrders } from '../../utils/order.util.js';

// Create main screen layout with filters and summary sections
// Show storage capacity and contents
// Display turnover analysis
export function createInventoryScreen() {
    const mainContent = document.querySelector('.main-content');
    const inventoryScreen = document.createElement('div');
    inventoryScreen.id = 'inventoryScreen';

    inventoryScreen.innerHTML = `
        <h1>Storage Inventory</h1>
        
        <div class="inventory-filters">
            <select id="reportPeriod">
                <option value="all">All Time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
            </select>
        </div>

        <div class="inventory-summary">
            <h2>Total Inventory Summary</h2>
            <div class="product-totals"></div>
        </div>

        <div class="turnover-analysis">
            <h2>Turnover Analysis</h2>
            <div class="turnover-stats"></div>
        </div>

        <div class="storage-grid"></div>
    `;

    mainContent.appendChild(inventoryScreen);
    initInventoryFilters();
    displayInventory();
}

function initInventoryFilters() {
    document.getElementById('reportPeriod').addEventListener('change', displayInventory);
}

// Show current storage status and product totals
// Calculate turnover rates for each product category
// Display capacity bars and product details
function displayInventory() {
    const storages = readStorages();
    const products = readProducts();
    const orders = readOrders();
    const period = document.getElementById('reportPeriod').value;

    const { startDate, endDate } = getDateRange(period);

    // Filter orders by date range
    const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.orderDate);
        return (!startDate || orderDate >= startDate) &&
            (!endDate || orderDate <= endDate);
    });

    const turnoverRates = calculateTurnoverRates(products, filteredOrders);

    const turnoverStats = document.querySelector('.turnover-stats');
    turnoverStats.innerHTML = `
        ${Object.entries(turnoverRates).map(([category, data]) => {
        const turnoverPercentage = (data.rate * 100).toFixed(2);
        return `
                <div class="turnover-item">
                    <h3>${category}</h3>
                    <p>Turnover Rate: ${turnoverPercentage}%</p>
                    <p>Total Orders: ${data.orders}</p>
                    <p>Total Sold: ${data.totalSold} units</p>
                    <p>Average Daily Sales: ${data.averageDailySales.toFixed(2)} units/day</p>
                    <p>Period: ${period}</p>
                </div>
            `;
    }).join('')}
    `;

    // Calculate totals across all storages
    const totalInventory = {
        raw: {
            quantity: 0,
            weight: 0
        },
        processed: {}
    };

    storages.forEach(storage => {
        // Sum raw products
        storage.contents.raw.forEach(item => {
            totalInventory.raw.quantity += item.quantity;
            totalInventory.raw.weight += item.quantity;
        });

        // Sum processed products
        storage.contents.processed.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            if (!product) return;

            const key = `${product.type}-${product.category}`;
            if (!totalInventory.processed[key]) {
                totalInventory.processed[key] = {
                    type: product.type,
                    category: product.category,
                    quantity: 0,
                    weight: 0
                };
            }
            totalInventory.processed[key].quantity += item.quantity;
            totalInventory.processed[key].weight += item.totalWeight;
        });
    });


    // Group all products from storage contents
    const productTotals = {};

    storages.forEach(storage => {
        // Process raw products
        storage.contents.raw.forEach(item => {
            const key = 'RAW';
            if (!productTotals[key]) {
                productTotals[key] = {
                    type: ProductType.RAW,
                    totalQuantity: 0,
                    totalWeight: 0
                };
            }
            productTotals[key].totalQuantity += item.quantity;
            productTotals[key].totalWeight += item.quantity; // Raw products quantity is in kg
        });

        // Process processed products
        storage.contents.processed.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            if (!product) return;

            const key = `${product.type}-${product.category}`;
            if (!productTotals[key]) {
                productTotals[key] = {
                    type: product.type,
                    category: product.category,
                    totalQuantity: 0,
                    totalWeight: 0
                };
            }
            productTotals[key].totalQuantity += item.quantity;
            productTotals[key].totalWeight += item.totalWeight;
        });
    });

    // Display total inventory
    const productTotalsDiv = document.querySelector('.product-totals');
    productTotalsDiv.innerHTML = `
        ${totalInventory.raw.quantity > 0 ? `
            <div class="total-item">
                <h3>Raw Materials</h3>
                <p>Total Quantity: ${totalInventory.raw.quantity.toFixed(2)} kg</p>
                <p>Total Weight: ${totalInventory.raw.weight.toFixed(2)} kg</p>
            </div>
        ` : ''}
        ${Object.entries(totalInventory.processed).map(([key, product]) => `
            <div class="total-item">
                <h3>${product.type} - ${product.category}</h3>
                <p>Total Packages: ${product.quantity}</p>
                <p>Total Weight: ${product.weight.toFixed(2)} kg</p>
            </div>
        `).join('')}
    `;

    // Display storage contents
    const storageGrid = document.querySelector('.storage-grid');
    storageGrid.innerHTML = storages.map(storage => {
        const totalWeight = storage.currentCapacity;
        const capacityPercentage = (totalWeight / storage.maxCapacity) * 100;

        return `
            <div class="storage-card">
                <div class="storage-header">
                    <h2>${storage.name} (${storage.location})</h2>
                    <div class="capacity-info">
                        <div>Capacity: ${totalWeight.toFixed(2)}kg / ${storage.maxCapacity}kg</div>
                        <div class="capacity-bar">
                            <div class="capacity-fill" style="width: ${capacityPercentage}%"></div>
                        </div>
                    </div>
                </div>
                <div class="storage-content">
                    ${storage.contents.raw.length === 0 && storage.contents.processed.length === 0 ?
                '<div class="empty-storage">No items stored</div>' :
                `
                            ${storage.contents.raw.length > 0 ? `
                                <div class="product-group">
                                    <h3>Raw Products</h3>
                                    ${storage.contents.raw.map(item => `
                                        <div class="product-item">
                                            <p><strong>Quantity:</strong> ${item.quantity}kg</p>
                                            <p><strong>Total Weight:</strong> ${item.quantity}kg</p>
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                            ${storage.contents.processed.length > 0 ? `
                                <div class="product-group">
                                    <h3>Processed Products</h3>
                                    ${storage.contents.processed.map(item => {
                    const product = products.find(p => p.id === item.productId);
                    return `
                                            <div class="product-item">
                                                <p><strong>Product:</strong> ${product ? `${product.type} - ${product.category}` : 'Unknown'}</p>
                                                <p><strong>Quantity:</strong> ${item.quantity} packages</p>
                                                <p><strong>Total Weight:</strong> ${item.totalWeight}kg</p>
                                            </div>
                                        `;
                }).join('')}
                                </div>
                            ` : ''}
                        `
            }
                </div>
            </div>
        `;
    }).join('');
}

function getDateRange(period) {
    const now = new Date();
    const startDate = new Date();

    switch (period) {
        case 'daily':
            startDate.setHours(0, 0, 0, 0);
            break;
        case 'weekly':
            startDate.setDate(now.getDate() - 7);
            break;
        case 'monthly':
            startDate.setDate(1); // Start of current month
            break;
        case 'all':
            return { startDate: null, endDate: null };
        default:
            return { startDate: null, endDate: null };
    }

    return { startDate, endDate: now };
}

// Calculate product turnover based on sales history
// Show average daily sales and total units sold
// Display period-specific statistics
function calculateTurnoverRates(products, orders) {
    const turnoverRates = {};

    products.forEach(product => {
        const productOrders = orders.filter(o => o.productId === product.id);
        const totalOrdered = productOrders.reduce((sum, order) => sum + order.quantity, 0);
        const daysInPeriod = Math.max(getDaysInPeriod(orders), 1); // At least 1 day

        turnoverRates[product.category] = {
            rate: totalOrdered / (product.quantity + totalOrdered), // Turnover rate as ratio
            orders: productOrders.length,
            totalSold: totalOrdered,
            averageDailySales: totalOrdered / daysInPeriod
        };
    });

    return turnoverRates;
}


function getDaysInPeriod(orders) {
    if (orders.length === 0) return 1; // Prevent division by zero

    const dates = orders.map(o => new Date(o.orderDate));
    const earliest = new Date(Math.min(...dates));
    const latest = new Date(Math.max(...dates));

    const diffTime = Math.abs(latest - earliest);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays || 1; // Return at least 1 day
}

export function showInventoryScreen() {
    if (!document.getElementById('inventoryScreen')) {
        createInventoryScreen();
    }
    ViewManager.showScreen('inventoryScreen');
    ViewManager.registerRefreshHandler('inventoryScreen', displayInventory);
}