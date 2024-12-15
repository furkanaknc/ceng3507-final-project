import { ViewManager } from '../../utils/view-manager.util.js';
import { readOrders } from '../../utils/order.util.js';
import { SalesReport } from '../../class/sales-report.class.js';

export function createSalesReportScreen() {
    const mainContent = document.querySelector('.main-content');
    const salesReportScreen = document.createElement('div');
    salesReportScreen.id = 'salesReportScreen';

    salesReportScreen.innerHTML = `
        <h1>Sales Report</h1>
        
        <div class="report-filters">
            <input type="date" id="startDate" placeholder="Start Date">
            <input type="date" id="endDate" placeholder="End Date">
            <button id="generateReport">Generate Report</button>
            <button id="exportReport">Export to CSV</button>
        </div>

        <div class="report-summary">
            <div class="total-revenue">
                <h3>Total Revenue</h3>
                <p id="totalRevenue">$0.00</p>
            </div>
            
            <div class="category-breakdown">
                <h3>Sales by Category</h3>
                <div id="categoryBreakdown"></div>
            </div>
        </div>
    `;

    mainContent.appendChild(salesReportScreen);
    initReportListeners();
}

function initReportListeners() {
    document.getElementById('generateReport').addEventListener('click', displayReport);
    document.getElementById('exportReport').addEventListener('click', exportReport);
}

function displayReport() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const orders = readOrders();
    
    // Create sales report instance
    const salesReport = new SalesReport(orders, startDate, endDate);
    
    // Update UI with report data
    document.getElementById('totalRevenue').textContent = 
        `$${salesReport.totalRevenue.toFixed(2)}`;

    const breakdown = document.getElementById('categoryBreakdown');
    breakdown.innerHTML = Object.entries(salesReport.unitsSoldByCategory)
        .map(([category, units]) => `
            <div class="category-section">
                <h3>${category}</h3>
                <div class="category-total">
                    <p>Total Units: ${units}</p>
                    <p>Total Revenue: $${salesReport.revenueByCategory[category].toFixed(2)}</p>
                </div>
            </div>
        `).join('');
}

function exportReport() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const orders = readOrders();
    const salesReport = new SalesReport(orders, startDate, endDate);
    
    const csvContent = salesReport.exportToCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `sales_report_${startDate || 'all'}_to_${endDate || 'present'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

export function showSalesReportScreen() {
    if (!document.getElementById('salesReportScreen')) {
        createSalesReportScreen();
    }
    
    ViewManager.registerRefreshHandler('salesReportScreen', () => {
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        if (startDate || endDate) {
            displayReport();
        }
    });
    
    ViewManager.showScreen('salesReportScreen');
}