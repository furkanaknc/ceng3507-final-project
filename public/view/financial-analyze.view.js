import { ViewManager } from '../../utils/view-manager.util.js';
import { readOrders } from '../../utils/order.util.js';
import { readPurchases } from '../../utils/purchase.util.js';
import { FinancialAnalysis } from '../../class/financial-analyze.class.js';

export function createFinancialScreen() {
    const mainContent = document.querySelector('.main-content');
    const financialScreen = document.createElement('div');
    financialScreen.id = 'financialScreen';

    financialScreen.innerHTML = `
        <h1>Financial Analysis</h1>
        
        <div class="financial-filters">
            <input type="date" id="startDate" placeholder="Start Date">
            <input type="date" id="endDate" placeholder="End Date">
            <input type="number" id="taxRate" value="18" min="0" max="100" step="0.1">
            <button id="generateReport">Generate Report</button>
        </div>

        <div class="financial-summary">
            <div class="summary-card income">
                <h3>Total Income</h3>
                <p id="totalIncome">$0.00</p>
            </div>
            <div class="summary-card expense">
                <h3>Total Expenses</h3>
                <p id="totalExpense">$0.00</p>
            </div>
            <div class="summary-card tax">
                <h3>Tax Amount</h3>
                <p id="taxAmount">$0.00</p>
            </div>
            <div class="summary-card profit">
                <h3>Net Profit</h3>
                <p id="netProfit">$0.00</p>
            </div>
        </div>
    `;

    mainContent.appendChild(financialScreen);
    initFinancialListeners();
}

function displayFinancialReport() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const taxRate = Number(document.getElementById('taxRate').value) / 100;

    const orders = readOrders();
    const purchases = readPurchases();

    const filteredOrders = filterByDateRange(orders, startDate, endDate);
    const filteredPurchases = filterByDateRange(purchases, startDate, endDate);

    const analysis = new FinancialAnalysis(filteredOrders, filteredPurchases, taxRate);
    const report = analysis.getFinancialReport();

    document.getElementById('totalIncome').textContent = `$${report.totalIncome}`;
    document.getElementById('totalExpense').textContent = `$${report.totalExpense}`;
    document.getElementById('taxAmount').textContent = `$${report.taxAmount}`;
    document.getElementById('netProfit').textContent = `$${report.netProfit}`;
}

function filterByDateRange(items, startDate, endDate) {
    return items.filter(item => {
        const itemDate = new Date(item.date || item.orderDate);
        return (!startDate || itemDate >= new Date(startDate)) &&
               (!endDate || itemDate <= new Date(endDate));
    });
}

function initFinancialListeners() {
    document.getElementById('generateReport').addEventListener('click', displayFinancialReport);
}

export function showFinancialScreen() {
    if (!document.getElementById('financialScreen')) {
        createFinancialScreen();
    }
    
    ViewManager.registerRefreshHandler('financialScreen', displayFinancialReport);
    ViewManager.showScreen('financialScreen');
}