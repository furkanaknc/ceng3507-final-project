import { showFarmerScreen } from "./public/view/farmer.view.js";
import { showSearchScreen } from "./public/view/search.view.js";
import { showPurchaseScreen } from "./public/view/purchase.view.js";
import { showProductScreen } from "./public/view/product.view.js";

document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.createElement('button');
    menuToggle.className = 'menu-toggle';
    menuToggle.innerHTML = '☰';
    document.body.appendChild(menuToggle);

    menuToggle.addEventListener('click', () => {
        document.querySelector('.sidebar').classList.toggle('active');
    });

    document.getElementById("openFarmerBtn").addEventListener("click", showFarmerScreen);
    document.getElementById("openSearchBtn").addEventListener("click", showSearchScreen);
    document.getElementById("openPurchaseBtn").addEventListener("click", showPurchaseScreen);
    document.getElementById("openProductBtn").addEventListener("click", showProductScreen);
});