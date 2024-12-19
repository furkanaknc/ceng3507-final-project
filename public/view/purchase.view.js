import { createPurchase, readPurchases, updatePurchase, deletePurchase } from '../../utils/purchase.util.js';
import { readFarmers } from '../../utils/farmer.util.js';
import { ViewManager } from '../../utils/view-manager.util.js';
import { readStorages } from '../../utils/storage.util.js';

export function createPurchaseScreen() {
    const mainContent = document.querySelector('.main-content');
    const purchaseScreen = document.createElement('div');
    purchaseScreen.id = 'purchaseScreen';

    purchaseScreen.innerHTML = `
        <h1>Purchase Records</h1>
        
        <!-- Create Form -->
        <form id="purchaseForm">
            <select id="farmerId" required>
                <option value="">Select Farmer</option>
                ${getFarmerOptions()}
            </select>
            <select id="storageId" required>
                <option value="">Select Storage</option>
                ${getStorageOptions()}
            </select>
            <input type="date" id="date" required />
            <input type="number" id="quantity" placeholder="Quantity (kg)" required step="0.01" min="0" />
            <input type="number" id="pricePerKg" placeholder="Price per kg" required step="0.01" min="0" />
            <button type="submit">Record Purchase</button>
        </form>

        <!-- Filters -->
        <div class="filters">
            <select id="sortBy">
                <option value="date">Sort by Date</option>
                <option value="farmer">Sort by Farmer</option>
                <option value="amount">Sort by Amount</option>
            </select>
            <input type="date" id="startDate" placeholder="Start Date" />
            <input type="date" id="endDate" placeholder="End Date" />
            <button id="filterBtn">Filter</button>
        </div>

        <!-- Purchase List -->
        <div id="purchaseList"></div>

        <!-- Expense Calculation -->
        <div class="expense-calculation">
            <h2>Expense Calculation</h2>
            <select id="expensePeriod">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
            </select>
            <button id="calculateExpenseBtn">Calculate Expense</button>
            <div id="expenseResult"></div>
        </div>

        <!-- Update Modal -->
         <div id="updatePurchaseModal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Update Purchase</h2>
            <form id="updatePurchaseForm">
                <input type="hidden" id="updateId">
                <select id="updateFarmerId" required>
                    <option value="">Select Farmer</option>
                    ${getFarmerOptions()}
                </select>
                <select id="updateStorageId" required>
                    <option value="">Select Storage</option>
                    ${getStorageOptions()}
                </select>
                <input type="date" id="updateDate" required />
                <input type="number" id="updatePricePerKg" placeholder="Price per kg" required step="0.01" min="0" />
                <button type="submit">Update Purchase</button>
            </form>
        </div>
    </div>
    `;

    mainContent.appendChild(purchaseScreen);
    initPurchaseFormListener();
    initSortingListener();
    initUpdateFormListener();
    initPurchaseListListeners();
    initExpenseCalculationListener();
    displayPurchases();
}

function getFarmerOptions() {
    const farmers = readFarmers();
    return farmers.map(farmer =>
        `<option value="${farmer.id}">${farmer.name}</option>`
    ).join('');
}

function getStorageOptions() {
    const storages = readStorages();
    return storages.map(storage =>
        `<option value="${storage.id}">${storage.name} (${storage.location}) - Available: ${storage.maxCapacity - storage.currentCapacity}kg</option>`
    ).join('');
}

function initPurchaseFormListener() {
    document.getElementById('purchaseForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const farmerId = Number(document.getElementById('farmerId').value);
        const storageId = Number(document.getElementById('storageId').value);
        const date = document.getElementById('date').value;
        const quantity = Number(document.getElementById('quantity').value);
        const pricePerKg = Number(document.getElementById('pricePerKg').value);

        try {
            const purchase = createPurchase(farmerId, storageId, date, quantity, pricePerKg);
            e.target.reset();
            displayPurchases();
            showMessage('Purchase recorded successfully', 'success');
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });
}

function initUpdateFormListener() {
    document.getElementById('updatePurchaseForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const updateId = Number(document.getElementById('updateId').value);
        const updateFarmerId = Number(document.getElementById('updateFarmerId').value);
        const updateStorageId = Number(document.getElementById('updateStorageId').value);
        const updateDate = document.getElementById('updateDate').value;
        const updatePricePerKg = Number(document.getElementById('updatePricePerKg').value);

        try {
            updatePurchase(updateId, {
                farmerId: updateFarmerId,
                storageId: updateStorageId,
                date: updateDate,
                pricePerKg: updatePricePerKg
            });

            closeModal('updatePurchaseModal');
            displayPurchases();
            showMessage('Purchase updated successfully', 'success');
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });
}

function initPurchaseListListeners() {
    const purchaseList = document.getElementById('purchaseList');
    purchaseList.addEventListener('click', async (e) => {
        const target = e.target;
        const purchaseCard = target.closest('.purchase-card');
        if (!purchaseCard) return;

        const purchaseId = Number(purchaseCard.dataset.purchaseId);

        if (target.classList.contains('delete-btn')) {
            try {
                deletePurchase(purchaseId);
                displayPurchases();
                showMessage('Purchase deleted successfully', 'success');
            } catch (error) {
                showMessage(error.message, 'error');
            }
        } else if (target.classList.contains('update-btn')) {
            const purchase = readPurchases().find(p => p.id === purchaseId);
            if (purchase) {
                fillUpdateForm(purchase);
                document.getElementById('updatePurchaseModal').style.display = 'block';
            }
        }
    });

    // Add modal close handlers
    const modal = document.getElementById('updatePurchaseModal');
    const closeBtn = modal.querySelector('.close');

    closeBtn.onclick = () => closeModal('updatePurchaseModal');
    window.onclick = (e) => {
        if (e.target === modal) {
            closeModal('updatePurchaseModal');
        }
    };
}

function fillUpdateForm(purchase) {
    document.getElementById('updateId').value = purchase.id;
    document.getElementById('updateFarmerId').value = purchase.farmerId;
    document.getElementById('updateStorageId').value = purchase.storageId;
    document.getElementById('updateDate').value = purchase.date.split('T')[0];
    document.getElementById('updatePricePerKg').value = purchase.pricePerKg;
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

function initExpenseCalculationListener() {
    document.getElementById('calculateExpenseBtn').addEventListener('click', calculateExpense);
}

function calculateExpense() {
    const period = document.getElementById('expensePeriod').value;
    const purchases = readPurchases();
    let totalExpense = 0;

    const now = new Date();
    purchases.forEach(purchase => {
        const purchaseDate = new Date(purchase.date);
        if (isWithinPeriod(purchaseDate, now, period)) {
            totalExpense += purchase.totalCost;
        }
    });

    document.getElementById('expenseResult').innerText = `Total Expense: $${totalExpense.toFixed(2)}`;
}

function isWithinPeriod(purchaseDate, now, period) {
    switch (period) {
        case 'daily':
            return purchaseDate.toDateString() === now.toDateString();
        case 'weekly':
            const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            return purchaseDate >= weekStart && purchaseDate <= weekEnd;
        case 'monthly':
            return purchaseDate.getMonth() === now.getMonth() && purchaseDate.getFullYear() === now.getFullYear();
        default:
            return false;
    }
}

function initSortingListener() {
    const sortBy = document.getElementById('sortBy');
    const filterBtn = document.getElementById('filterBtn');

    sortBy.addEventListener('change', displayPurchases);
    filterBtn.addEventListener('click', displayPurchases);
}

function displayPurchases() {
    const purchases = readPurchases();
    const farmers = readFarmers();
    const storages = readStorages();
    const sortBy = document.getElementById('sortBy').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    let filteredPurchases = [...purchases];

    // Date filtering
    if (startDate && endDate) {
        filteredPurchases = filteredPurchases.filter(purchase => {
            const purchaseDate = new Date(purchase.date);
            return purchaseDate >= new Date(startDate) &&
                purchaseDate <= new Date(endDate);
        });
    }

    // Sorting
    filteredPurchases.sort((a, b) => {
        switch (sortBy) {
            case 'date':
                return new Date(b.date) - new Date(a.date);
            case 'farmer':
                const farmerA = farmers.find(f => f.id === a.farmerId)?.name || '';
                const farmerB = farmers.find(f => f.id === b.farmerId)?.name || '';
                return farmerA.localeCompare(farmerB);
            case 'amount':
                return b.totalCost - a.totalCost;
            default:
                return 0;
        }
    });

    const purchaseList = document.getElementById('purchaseList');

    purchaseList.innerHTML = filteredPurchases.map(purchase => {
        const farmer = farmers.find(f => f.id === purchase.farmerId);
        const storage = storages.find(s => s.id === purchase.storageId);
        
        return `
            <div class="purchase-card" data-purchase-id="${purchase.id}">
                <h3>Purchase Details</h3>
                <p>
                    <strong>Date:</strong> ${new Date(purchase.date).toLocaleDateString()}<br>
                    <strong>Farmer:</strong> ${farmer?.name || 'Unknown'}<br>
                    <strong>Storage:</strong> ${storage?.name || 'Unknown'}<br>
                    <strong>Quantity:</strong> ${purchase.quantity} kg<br>
                    <strong>Price/kg:</strong> $${purchase.pricePerKg}<br>
                    <strong>Total Cost:</strong> $${purchase.totalCost.toFixed(2)}
                </p>
                <div class="button-group">
                    <button class="update-btn">Update</button>
                    <button class="delete-btn">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;

    const form = document.getElementById('purchaseForm');
    form.insertAdjacentElement('beforebegin', messageDiv);

    setTimeout(() => messageDiv.remove(), 3000);
}

export function showPurchaseScreen() {
    if (!document.getElementById('purchaseScreen')) {
        createPurchaseScreen();
    }

    ViewManager.registerRefreshHandler('purchaseScreen', () => {
        displayPurchases();

        // Refresh farmer options
        const farmerSelect = document.getElementById('farmerId');
        if (farmerSelect) {
            farmerSelect.innerHTML = `
                <option value="">Select Farmer</option>
                ${getFarmerOptions()}
            `;
        }
    });

    ViewManager.showScreen('purchaseScreen');
}