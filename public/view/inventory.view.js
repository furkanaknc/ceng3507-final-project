import { ViewManager } from '../../utils/view-manager.util.js';
import { getInventoryStatus, createInventoryItem, generateInventoryReport, transferToInventory, deleteInventoryItem, updateInventoryItem } from '../../utils/inventory.util.js';
import { readRawProducts } from '../../storage/raw-product.storage.js';
import { CategoryWeights } from '../../enum/product-category.enum.js';
import { readProducts } from '../../utils/product.util.js';

export function createInventoryScreen() {
    const mainContent = document.querySelector('.main-content');
    const inventoryScreen = document.createElement('div');
    inventoryScreen.id = 'inventoryScreen';

    inventoryScreen.innerHTML = `
        <div class="inventory-actions">
            <button id="transferFromRawBtn">Transfer from Raw Products</button>
            <button id="transferFromProcessedBtn">Transfer from Processed Products</button>
            <button id="generateReportBtn">Generate Report</button>
        </div>

        <div class="inventory-filters">
            <select id="typeFilter">
                <option value="">All Types</option>
                <option value="RAW">Raw Product</option>
                <option value="FRESH">Fresh</option>
                <option value="FROZEN">Frozen</option>
                <option value="ORGANIC">Organic</option>
            </select>
            <select id="categoryFilter">
                <option value="">All Categories</option>
                <option value="SMALL">Small</option>
                <option value="MEDIUM">Medium</option>
                <option value="LARGE">Large</option>
                <option value="FAMILY_PACK">Family Pack</option>
                <option value="BULK_PACK">Bulk Pack</option>
            </select>
            <select id="statusFilter">
                <option value="">All Statuses</option>
                <option value="LOW">Low Stock</option>
                <option value="MEDIUM">Medium Stock</option>
                <option value="SUFFICIENT">Sufficient Stock</option>
            </select>
        </div>

        <div class="inventory-list" id="inventoryList"></div>

        <div id="transferModal" class="modal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Transfer to Inventory</h2>
                <form id="transferForm">
                    <select id="sourceProduct" required>
                        <option value="">Select Product</option>
                    </select>
                    <input type="number" id="transferQuantity" min="1" placeholder="Quantity" required>
                    <input type="text" id="storageLocation" placeholder="Storage Location" required>
                    <button type="submit">Transfer</button>
                </form>
            </div>
        </div>

        <div id="editInventoryModal" class="modal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Update Inventory Item</h2>
                <form id="editInventoryForm">
                    <input type="hidden" id="editItemId">
                    <input type="number" id="editQuantity" placeholder="Quantity" required>
                    <input type="number" id="editReorderLevel" placeholder="Reorder Level" required>
                    <button type="submit">Update</button>
                </form>
            </div>
        </div>

        <div id="deleteConfirmModal" class="modal">
            <div class="modal-content">
                <h2>Confirm Delete</h2>
                <p>Are you sure you want to delete this item?</p>
                <div class="modal-actions">
                    <button id="confirmDeleteBtn">Delete</button>
                    <button id="cancelDeleteBtn">Cancel</button>
                </div>
            </div>
        </div>
    `;

    mainContent.appendChild(inventoryScreen);
    initInventoryListeners();
    displayInventory();
}


function displayInventory() {
    const inventory = getInventoryStatus();
    const typeFilter = document.getElementById('typeFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    const filteredInventory = inventory.filter(item =>
        (!typeFilter || item.type === typeFilter) &&
        (!categoryFilter || item.category === categoryFilter) &&
        (!statusFilter || item.status === statusFilter)
    );

    const inventoryList = document.getElementById('inventoryList');
    inventoryList.innerHTML = filteredInventory.map(item => {
        let quantityDisplay;
        let reorderLevelDisplay;

        if (item.type === 'RAW') {
            quantityDisplay = `${item.quantity}kg`;
            reorderLevelDisplay = `${item.reorderLevel}kg`;
        } else {
            const packageWeight = CategoryWeights[item.category];
            const totalWeightKg = ((item.quantity * packageWeight) / 1000).toFixed(2);
            quantityDisplay = `${item.quantity} packages (${totalWeightKg}kg)`;
            reorderLevelDisplay = `${item.reorderLevel} packages`;
        }

        return `
            <div class="inventory-card ${item.status.toLowerCase()}-stock">
                <div class="card-actions">
                    <button class="edit-btn" data-id="${item.id}">Edit</button>
                    <button class="delete-btn" data-id="${item.id}">Delete</button>
                </div>
                <h3>${item.type}${item.category !== 'RAW' ? ` - ${item.category}` : ''}</h3>
                <p>
                    <strong>Quantity:</strong> ${quantityDisplay}<br>
                    <strong>Reorder Level:</strong> ${reorderLevelDisplay}<br>
                    <strong>Status:</strong> ${item.status}<br>
                    <strong>Location:</strong> ${item.storageLocation}<br>
                    <strong>Next Restock:</strong> ${new Date(item.restockDate).toLocaleDateString()}<br>
                    <strong>Last Updated:</strong> ${new Date(item.lastUpdated).toLocaleString()}
                </p>
                ${item.needsRestock ? '<div class="restock-alert">Restock Needed!</div>' : ''}
            </div>
        `;
    }).join('');

    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => showEditModal(btn.dataset.id));
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => confirmDelete(btn.dataset.id));
    });
}

function initInventoryListeners() {
    const transferFromRawBtn = document.getElementById('transferFromRawBtn');
    const transferFromProcessedBtn = document.getElementById('transferFromProcessedBtn');
    const generateReportBtn = document.getElementById('generateReportBtn');

    if (transferFromRawBtn) {
        transferFromRawBtn.addEventListener('click', () => showTransferModal('RAW'));
    }

    if (transferFromProcessedBtn) {
        transferFromProcessedBtn.addEventListener('click', () => showTransferModal('PROCESSED'));
    }

    if (generateReportBtn) {
        generateReportBtn.addEventListener('click', generateInventoryReport);
    }

    document.getElementById('typeFilter').addEventListener('change', displayInventory);
    document.getElementById('categoryFilter').addEventListener('change', displayInventory);
    document.getElementById('statusFilter').addEventListener('change', displayInventory);

    const editForm = document.getElementById('editInventoryForm');
    if (editForm) {
        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const itemId = Number(document.getElementById('editItemId').value);
            
            try {
                const updates = {
                    quantity: Number(document.getElementById('editQuantity').value),
                    reorderLevel: Number(document.getElementById('editReorderLevel').value)
                };

                updateInventoryItem(itemId, updates);
                closeModal('editInventoryModal');
                displayInventory();
                showMessage('Item updated successfully', 'success');
            } catch (error) {
                showMessage(error.message, 'error');
            }
        });
    }
}

function showTransferModal(sourceType) {
    const modal = document.getElementById('transferModal');
    const sourceProduct = document.getElementById('sourceProduct');
    const transferForm = document.getElementById('transferForm');
    const closeBtn = modal.querySelector('.close');
    
    if (!modal || !sourceProduct || !transferForm) {
        console.error('Required elements not found');
        return;
    }

    // Create new form to clear old listeners
    const newForm = transferForm.cloneNode(true);
    transferForm.parentNode.replaceChild(newForm, transferForm);

    // Set source type
    newForm.setAttribute('data-source-type', sourceType);
    
    // Clear and populate options
    sourceProduct.innerHTML = '<option value="">Select Product</option>';
    
    if (sourceType === 'RAW') {
        const rawProducts = readRawProducts();
        console.log('Raw products:', rawProducts);
        
        if (rawProducts && rawProducts.length > 0) {
            const rawProduct = rawProducts[0];
            if (rawProduct) {
                const weightInKg = (rawProduct.weight / 1000).toFixed(2);
                sourceProduct.innerHTML += `
                    <option value="RAW">Raw Blueberries (${weightInKg}kg)</option>
                `;
            }
        }
    } else {
        const products = readProducts();
        console.log('Processed products:', products);
        
        if (products && products.length > 0) {
            products.forEach(product => {
                if (product.quantity > 0) {
                    sourceProduct.innerHTML += `
                        <option value="${product.id}">
                            ${product.type} - ${product.category} 
                            (${product.quantity} packages)
                        </option>
                    `;
                }
            });
        }
    }

    // Add form submit listener
    newForm.addEventListener('submit', handleTransferSubmit);

    // Add close button listener
    closeBtn.addEventListener('click', () => closeModal('transferModal'));

    // Show modal
    modal.style.display = 'block';
}

function handleTransferSubmit(e) {
    e.preventDefault();
    const sourceType = e.target.getAttribute('data-source-type');
    const sourceId = document.getElementById('sourceProduct').value;
    const quantity = Number(document.getElementById('transferQuantity').value);
    const location = document.getElementById('storageLocation').value;

    try {
        transferToInventory(sourceType, sourceId, quantity, location);
        closeModal('transferModal');
        displayInventory();
        showMessage('Transfer successful', 'success');
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

function showEditModal(itemId) {
    const inventory = getInventoryStatus();
    const item = inventory.find(i => i.id === Number(itemId));
    
    if (!item) return;

    document.getElementById('editItemId').value = item.id;
    document.getElementById('editQuantity').value = item.quantity;
    document.getElementById('editReorderLevel').value = item.reorderLevel;

    document.getElementById('editInventoryModal').style.display = 'block';
}

function confirmDelete(itemId) {
    const modal = document.getElementById('deleteConfirmModal');
    modal.style.display = 'block';

    const confirmBtn = document.getElementById('confirmDeleteBtn');
    const cancelBtn = document.getElementById('cancelDeleteBtn');

    confirmBtn.onclick = () => {
        deleteInventoryItem(Number(itemId));
        modal.style.display = 'none';
        displayInventory();
        showMessage('Item deleted successfully', 'success');
    };

    cancelBtn.onclick = () => {
        modal.style.display = 'none';
    };
}

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;

    const container = document.querySelector('.main-content');
    container.insertBefore(messageDiv, container.firstChild);

    setTimeout(() => messageDiv.remove(), 3000);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        const form = modal.querySelector('form');
        if (form) form.reset();
    }
}

export function showInventoryScreen() {
    if (!document.getElementById('inventoryScreen')) {
        createInventoryScreen();
        // Ekranı oluşturduktan sonra listener'ları ekleyin
        setTimeout(() => {
            initInventoryListeners();
            displayInventory();
        }, 0);
    }
    
    ViewManager.registerRefreshHandler('inventoryScreen', displayInventory);
    ViewManager.showScreen('inventoryScreen');
}