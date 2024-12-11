import { readFarmers } from '../../utils/farmer.util.js';
import { ViewManager } from '../../utils/view-manager.util.js';

export function createSearchScreen() {
    const mainContent = document.querySelector('.main-content');

    const searchScreen = document.createElement('div');
    searchScreen.id = 'searchScreen';

    searchScreen.innerHTML = `
        <h1>Search Farmers</h1>
        <div class="search-container">
            <form id="searchForm">
                <input type="text" id="searchName" placeholder="Search by name..." />
                <input type="text" id="searchLocation" placeholder="Search by location..." />
                <button type="button" id="searchBtn">Search</button>
                <button type="button" id="clearSearch">Clear</button>
            </form>
        </div>
        <div id="searchResults"></div>
    `;

    mainContent.appendChild(searchScreen);
    initSearchListeners();
}

function initSearchListeners() {
    const searchBtn = document.getElementById('searchBtn');
    const clearBtn = document.getElementById('clearSearch');

    searchBtn.addEventListener('click', performSearch);
    clearBtn.addEventListener('click', () => {
        document.getElementById('searchName').value = '';
        document.getElementById('searchLocation').value = '';
        document.getElementById('searchResults').innerHTML = '';
    });
}

function performSearch() {
    const farmers = readFarmers();
    const searchName = document.getElementById('searchName').value.toLowerCase().trim();
    const searchLocation = document.getElementById('searchLocation').value.toLowerCase().trim();

    // If both fields are empty, show no results
    if (!searchName && !searchLocation) {
        displaySearchResults([]);
        return;
    }

    const filteredFarmers = farmers.filter(farmer => {
        const nameMatch = !searchName || farmer.name.toLowerCase().includes(searchName);
        const locationMatch = !searchLocation || farmer.location.toLowerCase().includes(searchLocation);

        return nameMatch && locationMatch;
    });

    displaySearchResults(filteredFarmers);
}

function displaySearchResults(farmers) {
    const searchResults = document.getElementById('searchResults');
    if (farmers.length === 0) {
        searchResults.innerHTML = '<p class="no-results">No farmers found</p>';
        return;
    }

    searchResults.innerHTML = farmers.map(farmer => `
        <div class="farmer-card">
            <h3>Farmer Details</h3>
            <p>
                <strong>ID:</strong> ${farmer.id}<br>
                <strong>Name:</strong> ${farmer.name}<br>
                <strong>Contact:</strong> ${farmer.contact}<br>
                <strong>Location:</strong> ${farmer.location}
            </p>
        </div>
    `).join('');
}

export function showSearchScreen() {
    if (!document.getElementById('searchScreen')) {
        createSearchScreen();
    }
    ViewManager.showScreen('searchScreen');
}