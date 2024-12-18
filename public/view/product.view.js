import { createProduct, readProducts, updateProduct, updateProductStock, deleteProduct } from '../../utils/product.util.js';
import { ViewManager } from '../../utils/view-manager.util.js';
import { ProductType } from '../../enum/product-types.enum.js';
import { Product } from '../../class/product.class.js';
import { ProductCategory, CategoryWeights } from '../../enum/product-category.enum.js';
import { readStorages } from '../../utils/storage.util.js';

function getProductTypeOptions() {
    return Object.entries(ProductType)
        .map(([key, value]) => `<option value="${value}">${key}</option>`)
        .join('');
}

export function createProductScreen() {
    const mainContent = document.querySelector('.main-content');
    const productScreen = document.createElement('div');
    productScreen.id = 'productScreen';

    const storages = readStorages();

    productScreen.innerHTML = `
        <h1>Product Management</h1>
        
        <form id="productForm">
            <select id="category" required>
                <option value="">Select Category</option>
                ${Object.entries(ProductCategory)
            .map(([key, value]) => `<option value="${value}">${key}</option>`)
            .join('')}
            </select>
            <select id="type" required>
                <option value="">Select Type</option>
                ${getProductTypeOptions()}
            </select>
            <select id="storageId" required>
                <option value="">Select Storage</option>
                ${storages.map(storage => `
                    <option value="${storage.id}">
                        ${storage.name} (${storage.location}) - Available: ${storage.maxCapacity - storage.currentCapacity}kg
                    </option>
                `).join('')}
            </select>
            <input type="number" id="price" placeholder="Price ($)" required min="0" step="0.01" />
            <input type="number" id="quantity" placeholder="Quantity (packages)" required min="0" step="1" />
            <div id="customWeightDiv" style="display:none">
                <input type="number" id="customWeight" placeholder="Custom Weight (g)" min="0" step="1" />
            </div>
            <button type="submit">Add Product</button>
        </form>

        <div class="product-list" id="productList"></div>

        <div id="updateProductModal" class="modal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Update Product</h2>
                <form id="updateProductForm">
                    <input type="hidden" id="updateId">
                    <select id="updateCategory" required>
                        <option value="">Select Category</option>
                        ${Object.entries(ProductCategory)
            .map(([key, value]) => `<option value="${value}">${key}</option>`)
            .join('')}
                    </select>
                    <select id="updateType" required>
                        <option value="">Select Type</option>
                        ${getProductTypeOptions()}
                    </select>
                    <select id="updateStorageId" required>
                        <option value="">Select Storage</option>
                        ${storages.map(storage => `
                            <option value="${storage.id}">
                                ${storage.name} (${storage.location}) - Available: ${storage.maxCapacity - storage.currentCapacity}kg
                            </option>
                        `).join('')}
                    </select>
                    <input type="number" id="updatePrice" placeholder="Price ($)" required min="0" step="0.01" />
                    <input type="number" id="updateQuantity" placeholder="Quantity (packages)" required min="0" step="1" />
                    <div id="updateCustomWeightDiv" style="display:none">
                        <input type="number" id="updateCustomWeight" placeholder="Custom Weight (g)" min="0" step="1" />
                    </div>
                    <button type="submit">Update Product</button>
                </form>
            </div>
        </div>
    `;

    mainContent.appendChild(productScreen);
    setTimeout(() => {
        initProductFormListener();
        initProductListListeners();
        initUpdateFormListener();
        displayProducts();
    }, 0);
}


function initProductFormListener() {
    const form = document.getElementById('productForm');
    if (!form) {
        console.error('Product form not found');
        return;
    }

    document.getElementById('category').addEventListener('change', (e) => {
        const customWeightDiv = document.getElementById('customWeightDiv');
        const customWeightInput = document.getElementById('customWeight');

        if (e.target.value === ProductCategory.PREMIUM) {
            customWeightDiv.style.display = 'block';
            customWeightInput.required = true;
        } else {
            customWeightDiv.style.display = 'none';
            customWeightInput.required = false;
        }
    });

    form.addEventListener('submit', e => {
        e.preventDefault();
        try {
            const category = document.getElementById('category').value;
            const type = document.getElementById('type').value;
            const storageId = Number(document.getElementById('storageId').value);
            const price = Number(document.getElementById('price').value);
            const quantity = Number(document.getElementById('quantity').value);
            const customWeight = document.getElementById('customWeight')?.value;

            console.log('Form Values:', {
                category,
                type,
                storageId,
                price,
                quantity,
                customWeight
            });

            // Validate values before sending
            if (!storageId) {
                throw new Error('Please select a storage');
            }

            if (!quantity || quantity <= 0) {
                throw new Error('Quantity must be greater than 0');
            }

            createProduct(
                category,
                price,
                type,
                storageId,
                category === ProductCategory.PREMIUM ? Number(customWeight) : null,
                quantity
            );

            form.reset();
            displayProducts();
            showMessage('Product created successfully', 'success');
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });

    document.getElementById('category').addEventListener('change', (e) => {
        const customWeightDiv = document.getElementById('customWeightDiv');
        const customWeightInput = document.getElementById('customWeight');

        if (e.target.value === ProductCategory.PREMIUM) {
            customWeightDiv.style.display = 'block';
            customWeightInput.required = true;
        } else {
            customWeightDiv.style.display = 'none';
            customWeightInput.required = false;
        }
    });
}

function initProductListListeners() {
    document.getElementById('productList').addEventListener('click', e => {
        const productCard = e.target.closest('[data-product-id]');
        if (!productCard) return;

        const productId = Number(productCard.dataset.productId);

        if (e.target.classList.contains('delete-btn')) {
            deleteProduct(productId);
            displayProducts();
            showMessage('Product deleted successfully', 'success');
        } else if (e.target.classList.contains('update-btn')) {
            const product = readProducts().find(p => p.id === productId);
            if (product) {
                fillUpdateForm(product);
                document.getElementById('updateProductModal').style.display = 'block';
            }
        }
    });
}

function initUpdateFormListener() {
    document.getElementById('updateProductForm').addEventListener('submit', e => {
        e.preventDefault();
        try {
            const id = Number(document.getElementById('updateId').value);
            const category = document.getElementById('updateCategory').value;
            const type = document.getElementById('updateType').value;
            const price = Number(document.getElementById('updatePrice').value);
            const quantity = Number(document.getElementById('updateQuantity').value);
            const customWeight = category === ProductCategory.PREMIUM ?
                Number(document.getElementById('updateCustomWeight').value) : null;

            updateProduct(id, {
                category,
                type,
                price,
                quantity,
                weight: category === ProductCategory.PREMIUM ? customWeight : CategoryWeights[category]
            });

            closeModal('updateProductModal');
            displayProducts();
            showMessage('Product updated successfully', 'success');
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });

    // Add category change listener for update form
    document.getElementById('updateCategory').addEventListener('change', (e) => {
        const customWeightDiv = document.getElementById('updateCustomWeightDiv');
        const customWeightInput = document.getElementById('updateCustomWeight');

        if (e.target.value === ProductCategory.PREMIUM) {
            customWeightDiv.style.display = 'block';
            customWeightInput.required = true;
        } else {
            customWeightDiv.style.display = 'none';
            customWeightInput.required = false;
        }
    });

    const modal = document.getElementById('updateProductModal');
    const closeBtn = modal.querySelector('.close');

    closeBtn.onclick = () => closeModal('updateProductModal');
    window.onclick = (e) => {
        if (e.target === modal) {
            closeModal('updateProductModal');
        }
    };
}


function displayProducts() {
    const products = readProducts();
    const storages = readStorages();
    const productList = document.getElementById('productList');

    productList.innerHTML = products.map(product => {
        const storage = storages.find(s => s.id === product.storageId);
        
        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="stock-indicator" style="background-color: ${product.getStatusColor()}"></div>
                <h3>
                    <span class="product-category">${product.category}</span>
                    <span class="product-type">${product.type}</span>
                </h3>
                <p>
                    <strong>Storage:</strong> ${storage ? `${storage.name} (${storage.location})` : 'Not assigned'}<br>
                    <strong>Weight:</strong> ${product.weight}g<br>
                    <strong>Price:</strong> $${product.getFormattedPrice()}<br>
                    <strong>In Stock:</strong> ${product.quantity} packages<br>
                    <strong>Total Weight:</strong> ${product.getTotalWeight()}kg<br>
                    <strong>Status:</strong> ${product.getStockStatus().toUpperCase()}
                </p>
                <div class="button-group">
                    <button class="update-btn">Update</button>
                    <button class="delete-btn">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function fillUpdateForm(product) {
    document.getElementById('updateId').value = product.id;
    document.getElementById('updateCategory').value = product.category;
    document.getElementById('updateType').value = product.type;
    document.getElementById('updatePrice').value = product.price;
    document.getElementById('updateQuantity').value = product.quantity;

    const customWeightDiv = document.getElementById('updateCustomWeightDiv');
    const customWeightInput = document.getElementById('updateCustomWeight');

    if (product.category === ProductCategory.PREMIUM) {
        customWeightDiv.style.display = 'block';
        customWeightInput.required = true;
        customWeightInput.value = product.weight;
    } else {
        customWeightDiv.style.display = 'none';
        customWeightInput.required = false;
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}


function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;

    const form = document.getElementById('productForm');
    form.insertAdjacentElement('beforebegin', messageDiv);

    setTimeout(() => messageDiv.remove(), 3000);
}

export function showProductScreen() {
    if (!document.getElementById('productScreen')) {
        createProductScreen();
    }

    ViewManager.registerRefreshHandler('productScreen', () => {
        displayProducts();
    });

    ViewManager.showScreen('productScreen');
}