import { createFarmer, readFarmers, deleteFarmer, updateFarmer } from "../../utils/farmer.util.js";
import { ViewManager } from "../../utils/view-manager.util.js";
import { exportToCSV } from "../../utils/export.util.js";

function createFarmerScreen() {
    const mainContent = document.querySelector('.main-content');
    const farmerScreen = document.createElement('div');
    farmerScreen.id = 'farmerScreen';

    farmerScreen.innerHTML = `
        <h1>Farmer Management</h1>
        
        <div class="actions">
            <button id="exportBtn" class="export-btn">Export to CSV</button>
        </div>

        <form id="farmerForm">
            <input type="text" id="name" placeholder="Name" required />
            <input type="tel" id="phone" placeholder="Phone Number" required />
            <input type="email" id="email" placeholder="Email" required />
            <input type="text" id="address" placeholder="Address" required />
            <input type="text" id="city" placeholder="City/Region" required />
            <button type="submit">Add Farmer</button>
        </form>

        <div id="farmerList"></div>

        <div id="updateModal" class="modal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Update Farmer</h2>
                <form id="updateForm">
                    <input type="hidden" id="updateId">
                    <input type="text" id="updateName" placeholder="Name" required />
                    <input type="tel" id="updatePhone" placeholder="Phone Number" required />
                    <input type="email" id="updateEmail" placeholder="Email" required />
                    <input type="text" id="updateAddress" placeholder="Address" required />
                    <input type="text" id="updateCity" placeholder="City/Region" required />
                    <button type="submit">Update</button>
                </form>
            </div>
        </div>
    `;

    mainContent.appendChild(farmerScreen);
    initFarmerFormListener();
    initFarmerListListeners();
    initUpdateFormListener();
    initExportListener();
    initModalClosing();
}

function initExportListener() {
    document.getElementById('exportBtn').addEventListener('click', () => {
        const farmers = readFarmers();
        exportToCSV(farmers);
    });
}

function initFarmerListListeners() {
    const farmerList = document.getElementById('farmerList');
    farmerList.addEventListener('click', (e) => {
        const farmer = e.target.closest('[data-farmer-id]');
        if (!farmer) return;

        const farmerId = Number(farmer.dataset.farmerId);

        if (e.target.classList.contains('delete-btn')) {
            deleteFarmer(farmerId);
            displayFarmers();
        } else if (e.target.classList.contains('update-btn')) {
            handleUpdate(farmerId);
        }
    });
}

function handleUpdate(id) {
    const farmers = readFarmers();
    const farmer = farmers.find(f => f.id === id);

    if (!farmer) return;

    document.getElementById('updateId').value = farmer.id;
    document.getElementById('updateName').value = farmer.name;
    document.getElementById('updatePhone').value = farmer.contact.phone;
    document.getElementById('updateEmail').value = farmer.contact.email;
    document.getElementById('updateAddress').value = farmer.location.address;
    document.getElementById('updateCity').value = farmer.location.city;
    document.getElementById('updateModal').style.display = 'block';
}

function initUpdateFormListener() {
    document.getElementById('updateForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const id = Number(document.getElementById('updateId').value);
        const name = document.getElementById('updateName').value;
        const phone = document.getElementById('updatePhone').value;
        const email = document.getElementById('updateEmail').value;
        const address = document.getElementById('updateAddress').value;
        const city = document.getElementById('updateCity').value;

        updateFarmer(id, {
            name,
            contact: { phone, email },
            location: { address, city }
        });

        document.getElementById('updateModal').style.display = 'none';
        displayFarmers();
    });
}

function initFarmerFormListener() {
    document.getElementById("farmerForm").addEventListener("submit", async function (e) {
        e.preventDefault();
        const name = document.getElementById("name").value;
        const phone = document.getElementById("phone").value;
        const email = document.getElementById("email").value;
        const address = document.getElementById("address").value;
        const city = document.getElementById("city").value;

        try {
            const farmer = createFarmer(
                name,
                { phone, email },
                { address, city }
            );
            displayFarmers();
            this.reset();

            showMessage(`Farmer ${farmer.name} added successfully`, 'success');
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });
}

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;

    const form = document.getElementById('farmerForm');
    form.insertAdjacentElement('beforebegin', messageDiv);

    setTimeout(() => messageDiv.remove(), 3000);
}

function displayFarmers() {
    const farmers = readFarmers();
    const farmerList = document.getElementById("farmerList");

    farmerList.innerHTML = farmers.map(farmer => `
        <div class="farmer-card" data-farmer-id="${farmer.id}">
            <h3>Farmer Details</h3>
            <p>
                <strong>ID:</strong> ${farmer.id}<br>
                <strong>Name:</strong> ${farmer.name}<br>
                <strong>Phone:</strong> ${farmer.contact.phone}<br>
                <strong>Email:</strong> ${farmer.contact.email}<br>
                <strong>Address:</strong> ${farmer.location.address}<br>
                <strong>City:</strong> ${farmer.location.city}
            </p>
            <div class="button-group">
                <button class="delete-btn">Delete</button>
                <button class="update-btn">Update</button>
            </div>
        </div>
    `).join("");
}

function initModalClosing() {
    const modal = document.getElementById('updateModal');
    const closeBtn = modal.querySelector('.close');

    // Close when clicking X
    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };

    // Close when clicking outside
    window.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    };
}

export function showFarmerScreen() {
    if (!document.getElementById('farmerScreen')) {
        createFarmerScreen();
    }
    
    ViewManager.registerRefreshHandler('farmerScreen', () => {
        displayFarmers();
    });
    
    ViewManager.showScreen('farmerScreen');
}