import { createStorage, readStorages, updateStorage, deleteStorage } from '../../utils/storage.util.js';
import { ViewManager } from '../../utils/view-manager.util.js';

export function createStorageScreen() {
    const mainContent = document.querySelector('.main-content');
    const storageScreen = document.createElement('div');
    storageScreen.id = 'storageScreen';

    storageScreen.innerHTML = `
        <h1>Storage Management</h1>
        
        <form id="storageForm">
            <h2>Create Storage</h2>
            <input type="text" id="storageLocation" placeholder="Location" required />
            <input type="text" id="storageName" placeholder="Name" required />
            <input type="number" id="storageMaxCapacity" placeholder="Max Capacity (kg)" required min="0" step="0.01" />
            <button type="submit">Create Storage</button>
        </form>

        <div id="storageList"></div>

        <div id="updateStorageModal" class="modal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Update Storage</h2>
                <form id="updateStorageForm">
                    <input type="hidden" id="updateStorageId">
                    <input type="text" id="updateStorageLocation" placeholder="Location" required />
                    <input type="text" id="updateStorageName" placeholder="Name" required />
                    <input type="number" id="updateStorageMaxCapacity" placeholder="Max Capacity (kg)" required min="0" step="0.01" />
                    <button type="submit">Update Storage</button>
                </form>
            </div>
        </div>
    `;

    mainContent.appendChild(storageScreen);
    initStorageFormListener();
    initStorageListListeners();
    initUpdateStorageFormListener();
    displayStorages();
}

function initStorageFormListener() {
    document.getElementById('storageForm').addEventListener('submit', e => {
        e.preventDefault();
        try {
            const location = document.getElementById('storageLocation').value;
            const name = document.getElementById('storageName').value;
            const maxCapacity = Number(document.getElementById('storageMaxCapacity').value);

            createStorage(location, name, maxCapacity);
            e.target.reset();
            showMessage('Storage created successfully', 'success');
            displayStorages();
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });
}

function displayStorages() {
    const storages = readStorages();
    const storageList = document.getElementById('storageList');

    storageList.innerHTML = storages.map(storage => `
        <div class="storage-card" data-storage-id="${storage.id}">
            <h3>${storage.name} (${storage.location})</h3>
            <p>
                <strong>Max Capacity:</strong> ${storage.maxCapacity} kg<br>
                <strong>Current Capacity:</strong> ${storage.currentCapacity} kg
            </p>
            <div class="button-group">
                <button class="update-storage-btn">Update</button>
                <button class="delete-storage-btn">Delete</button>
            </div>
        </div>
    `).join('');
}

function initStorageListListeners() {
    document.getElementById('storageList').addEventListener('click', e => {
        const storageCard = e.target.closest('.storage-card');
        if (!storageCard) return;

        const storageId = Number(storageCard.dataset.storageId);

        if (e.target.classList.contains('delete-storage-btn')) {
            deleteStorage(storageId);
            displayStorages();
            showMessage('Storage deleted successfully', 'success');
        } else if (e.target.classList.contains('update-storage-btn')) {
            const storage = readStorages().find(s => s.id === storageId);
            if (storage) {
                fillUpdateStorageForm(storage);
                document.getElementById('updateStorageModal').style.display = 'block';
            }
        }
    });

    const modal = document.getElementById('updateStorageModal');
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = () => closeModal('updateStorageModal');
    window.onclick = (e) => {
        if (e.target === modal) {
            closeModal('updateStorageModal');
        }
    };
}

function fillUpdateStorageForm(storage) {
    document.getElementById('updateStorageId').value = storage.id;
    document.getElementById('updateStorageLocation').value = storage.location;
    document.getElementById('updateStorageName').value = storage.name;
    document.getElementById('updateStorageMaxCapacity').value = storage.maxCapacity;
}

function initUpdateStorageFormListener() {
    document.getElementById('updateStorageForm').addEventListener('submit', e => {
        e.preventDefault();
        try {
            const id = Number(document.getElementById('updateStorageId').value);
            const location = document.getElementById('updateStorageLocation').value;
            const name = document.getElementById('updateStorageName').value;
            const maxCapacity = Number(document.getElementById('updateStorageMaxCapacity').value);

            updateStorage(id, { location, name, maxCapacity });
            closeModal('updateStorageModal');
            displayStorages();
            showMessage('Storage updated successfully', 'success');
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });
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

    const form = document.getElementById('storageForm');
    form.insertAdjacentElement('beforebegin', messageDiv);

    setTimeout(() => messageDiv.remove(), 3000);
}

export function showStorageScreen() {
    if (!document.getElementById('storageScreen')) {
        createStorageScreen();
    }

    ViewManager.registerRefreshHandler('storageScreen', () => {displayStorages()});
    ViewManager.showScreen('storageScreen');
}