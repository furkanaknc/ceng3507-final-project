import { ViewManager } from '../../utils/view-manager.util.js';
import { readOrders } from '../../utils/order.util.js';
import { SalesReport } from '../../class/sales-report.class.js';

// Create report screen with filters and summary sections
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
                <h3>Revenue Summary</h3>
                <p>Net Revenue: $<span id="netRevenue">0.00</span></p>
                <p>Gross Revenue: $<span id="totalRevenue">0.00</span></p>
                <p>Tax Amount: $<span id="totalTax">0.00</span></p>
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

// Set up report generation and export buttons
function initReportListeners() {
    document.getElementById('generateReport').addEventListener('click', displayReport);
    document.getElementById('exportReport').addEventListener('click', exportReport);
}

// Filter orders by date range
// Calculate revenue and tax
// Show category breakdown
function displayReport() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    // Get tax rate from financial analysis screen
    const financialTaxRate = document.querySelector('#financialScreen #taxRate');
    const taxRate = financialTaxRate ? Number(financialTaxRate.value) / 100 : 0.18;

    const orders = readOrders();
    const filteredOrders = orders.filter(order => {
        if (!startDate && !endDate) return true;
        
        const orderDate = new Date(order.orderDate);
        orderDate.setHours(0, 0, 0, 0);
        
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        if (start) start.setHours(0, 0, 0, 0);
        if (end) end.setHours(23, 59, 59, 999);

        return (!start || orderDate >= start) && (!end || orderDate <= end);
    });
    
    const salesReport = new SalesReport(filteredOrders, startDate, endDate, taxRate);
    
    // Update display with calculations including tax
    document.getElementById('totalRevenue').textContent = salesReport.totalRevenue.toFixed(2);
    document.getElementById('totalTax').textContent = salesReport.taxAmount.toFixed(2);
    document.getElementById('netRevenue').textContent = salesReport.netRevenue.toFixed(2);


    // Update category breakdown
    const categoryBreakdown = document.getElementById('categoryBreakdown');
    categoryBreakdown.innerHTML = Object.entries(salesReport.revenueByCategory)
        .map(([category, revenue]) => `
            <div class="category-item">
                <h4>${category}</h4>
                <p>Units Sold: ${salesReport.unitsSoldByCategory[category]}</p>
                <p>Revenue: $${revenue.toFixed(2)}</p>
            </div>
        `).join('');
}

// Create CSV content
// Download report file
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