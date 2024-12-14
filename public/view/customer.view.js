import { createCustomer, readCustomers, updateCustomer, deleteCustomer } from '../../utils/customer.util.js';
import { ViewManager } from '../../utils/view-manager.util.js';

export function createCustomerScreen() {
    const mainContent = document.querySelector('.main-content');
    const customerScreen = document.createElement('div');
    customerScreen.id = 'customerScreen';

    customerScreen.innerHTML = `
        <h1>Customer Management</h1>
        
        <form id="customerForm">
            <input type="text" id="name" placeholder="Customer Name" required />
            <input type="tel" id="phone" placeholder="Phone Number" required />
            <input type="email" id="email" placeholder="Email" required />
            <input type="text" id="street" placeholder="Street Address" required />
            <input type="text" id="city" placeholder="City" required />
            <input type="text" id="postalCode" placeholder="Postal Code" required />
            <button type="submit">Add Customer</button>
        </form>

        <div id="customerList"></div>

        <div id="updateModal" class="modal">
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Update Customer</h2>
                <form id="updateForm">
                    <input type="hidden" id="updateId">
                    <input type="text" id="updateName" placeholder="Name />
                    <input type="text" id="updateName" placeholder="Name" required />
                    <input type="tel" id="updatePhone" placeholder="Phone Number" required />
                    <input type="email" id="updateEmail" placeholder="Email" required />
                    <input type="text" id="updateStreet" placeholder="Street Address" required />
                    <input type="text" id="updateCity" placeholder="City" required />
                    <input type="text" id="updatePostalCode" placeholder="Postal Code" required />
                    <button type="submit">Update</button>
                </form>
            </div>
        </div>
    `;

    mainContent.appendChild(customerScreen);
    initCustomerFormListener();
    initCustomerListListeners();
    initUpdateFormListener();
    displayCustomers();
}

function initCustomerFormListener() {
    document.getElementById('customerForm').addEventListener('submit', e => {
        e.preventDefault();
        try {
            createCustomer(
                document.getElementById('name').value,
                {
                    phone: document.getElementById('phone').value,
                    email: document.getElementById('email').value
                },
                {
                    street: document.getElementById('street').value,
                    city: document.getElementById('city').value,
                    postalCode: document.getElementById('postalCode').value
                }
            );
            e.target.reset();
            displayCustomers();
            showMessage('Customer added successfully', 'success');
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });
}

function displayCustomers() {
    const customers = readCustomers();
    const customerList = document.getElementById('customerList');
    
    customerList.innerHTML = customers.map(customer => `
        <div class="customer-card" data-customer-id="${customer.id}">
            <h3>${customer.name}</h3>
            <p>
                <strong>Contact:</strong><br>
                Phone: ${customer.contact.phone}<br>
                Email: ${customer.contact.email}
            </p>
            <p>
                <strong>Address:</strong><br>
                ${customer.address.street}<br>
                ${customer.address.city}, ${customer.address.postalCode}
            </p>
            <div class="button-group">
                <button class="update-btn">Update</button>
                <button class="delete-btn">Delete</button>
            </div>
        </div>
    `).join('');
}

function initCustomerListListeners() {
    document.getElementById('customerList').addEventListener('click', e => {
        const customerCard = e.target.closest('.customer-card');
        if (!customerCard) return;

        const customerId = Number(customerCard.dataset.customerId);

        if (e.target.classList.contains('delete-btn')) {
            deleteCustomer(customerId);
            displayCustomers();
            showMessage('Customer deleted successfully', 'success');
        } else if (e.target.classList.contains('update-btn')) {
            const customer = readCustomers().find(c => c.id === customerId);
            if (customer) {
                fillUpdateForm(customer);
                document.getElementById('updateModal').style.display = 'block';
            }
        }
    });

    // Add modal close handlers
    const modal = document.getElementById('updateModal');
    const closeBtn = modal.querySelector('.close');

    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };

    window.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    };
}

function fillUpdateForm(customer) {
    document.getElementById('updateId').value = customer.id;
    document.getElementById('updateName').value = customer.name;
    document.getElementById('updatePhone').value = customer.contact.phone;
    document.getElementById('updateEmail').value = customer.contact.email;
    document.getElementById('updateStreet').value = customer.address.street;
    document.getElementById('updateCity').value = customer.address.city;
    document.getElementById('updatePostalCode').value = customer.address.postalCode;
}

function initUpdateFormListener() {
    document.getElementById('updateForm').addEventListener('submit', e => {
        e.preventDefault();
        try {
            const id = Number(document.getElementById('updateId').value);
            updateCustomer(id, {
                name: document.getElementById('updateName').value,
                contact: {
                    phone: document.getElementById('updatePhone').value,
                    email: document.getElementById('updateEmail').value
                },
                address: {
                    street: document.getElementById('updateStreet').value,
                    city: document.getElementById('updateCity').value,
                    postalCode: document.getElementById('updatePostalCode').value
                }
            });
            
            document.getElementById('updateModal').style.display = 'none';
            displayCustomers();
            showMessage('Customer updated successfully', 'success');
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });
}

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    const form = document.getElementById('customerForm');
    form.insertAdjacentElement('beforebegin', messageDiv);
    
    setTimeout(() => messageDiv.remove(), 3000);
}

export function showCustomerScreen() {
    if (!document.getElementById('customerScreen')) {
        createCustomerScreen();
    }

    ViewManager.registerRefreshHandler('customerScreen', () => {
        displayCustomers(); 
    });

    ViewManager.showScreen('customerScreen');
}