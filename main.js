import { showFarmerScreen } from "./public/view/farmer.view.js";
import { showSearchScreen } from "./public/view/search.view.js";
import { showPurchaseScreen } from "./public/view/purchase.view.js";
import { showProductScreen } from "./public/view/product.view.js";
import { showCustomerScreen } from "./public/view/customer.view.js";
import { showOrderScreen } from "./public/view/order.view.js";
import { showSalesReportScreen } from "./public/view/sales-report.view.js";
import { showFinancialScreen } from "./public/view/financial-analyze.view.js";
import { showStorageScreen } from "./public/view/storage.view.js";
import { showInventoryScreen } from "./public/view/inventory.view.js";

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
    document.getElementById("openCustomerBtn").addEventListener("click", showCustomerScreen);
    document.getElementById("openOrderBtn").addEventListener("click", showOrderScreen);
    document.getElementById("openSalesReportBtn").addEventListener("click", showSalesReportScreen);
    document.getElementById("openFinancialBtn").addEventListener("click", showFinancialScreen);
    document.getElementById("openStorageBtn").addEventListener("click", showStorageScreen);
    document.getElementById("openInventoryBtn").addEventListener("click", showInventoryScreen);    

});