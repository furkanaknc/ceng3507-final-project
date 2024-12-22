export class FinancialAnalysis {
    constructor(orders = [], purchases = [], taxRate = 0.18) {
        this.orders = orders;
        this.purchases = purchases;
        this.taxRate = taxRate;
        this.totalIncome = 0;
        this.totalExpense = 0;
        this.taxAmount = 0;
        this.netProfit = 0;
        this.calculateFinancial();
    }

    // Calculate total income, expenses, tax and profit
    calculateFinancial() {
        // Calculate total income from orders
        this.totalIncome = this.orders.reduce((sum, order) =>
            sum + order.totalPrice, 0);

        // Calculate total expenses from purchases
        this.totalExpense = this.purchases.reduce((sum, purchase) =>
            sum + purchase.totalCost, 0);

        // Calculate tax amount
        this.taxAmount = this.totalIncome * this.taxRate;

        // Calculate net profit
        this.netProfit = this.totalIncome - this.totalExpense - this.taxAmount;
    }

    // Get financial summary report
    getFinancialReport() {
        return {
            totalIncome: this.totalIncome.toFixed(2),
            totalExpense: this.totalExpense.toFixed(2),
            taxAmount: this.taxAmount.toFixed(2),
            netProfit: this.netProfit.toFixed(2),
            profitMargin: ((this.netProfit / this.totalIncome) * 100).toFixed(2)
        };
    }

    exportToCSV() {
        const report = this.getFinancialReport();
        const headers = ['Metric', 'Value'];
        const rows = [
            ['Total Income', `$${report.totalIncome}`],
            ['Total Expenses', `$${report.totalExpense}`],
            ['Tax Amount', `$${report.taxAmount}`],
            ['Net Profit', `$${report.netProfit}`],
            ['Profit Margin', `${report.profitMargin}%`],
            ['Tax Rate', `${(this.taxRate * 100).toFixed(1)}%`],
            ['Number of Orders', this.orders.length],
            ['Number of Purchases', this.purchases.length]
        ];

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `financial_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Export detailed financial report as CSV
    exportDetailedCSV() {
        const report = this.getFinancialReport();
        
        // Group sales by category and type
        const salesByCategoryAndType = {}; 
        this.orders.forEach(order => {
            const key = `${order.productCategory}-${order.productType}`;
            if (!salesByCategoryAndType[key]) {
                salesByCategoryAndType[key] = {
                    category: order.productCategory,
                    type: order.productType,
                    units: 0,
                    revenue: 0
                };
            }
            salesByCategoryAndType[key].units += order.quantity;
            salesByCategoryAndType[key].revenue += order.totalPrice;
        });

        const summary = [
            ['Financial Summary'],
            ['Metric', 'Value'],
            ['Total Income', `$${report.totalIncome}`],
            ['Total Expenses', `$${report.totalExpense}`],
            ['Tax Amount', `$${report.taxAmount}`],
            ['Net Profit', `$${report.netProfit}`],
            ['Profit Margin', `${report.profitMargin}%`],
            ['Tax Rate', `${(this.taxRate * 100).toFixed(1)}%`],
            ['']
        ];

        const salesSection = [
            ['Sales by Category and Type'],
            ['Category', 'Type', 'Units Sold', 'Revenue', 'Tax Applied'],
            ...Object.values(salesByCategoryAndType).map(data => [
                data.category,
                data.type,
                data.units,
                `$${data.revenue.toFixed(2)}`,
                `$${(data.revenue * this.taxRate).toFixed(2)}`
            ]),
            [''],
            ['Category Totals'],
            ...Object.entries(this.getCategoryTotals()).map(([category, total]) => [
                category,
                '',
                total.units,
                `$${total.revenue.toFixed(2)}`,
                `$${(total.revenue * this.taxRate).toFixed(2)}`
            ]),
            ['']
        ];

        const purchaseSection = [
            ['Purchase Details'],
            ['Date', 'Quantity (kg)', 'Price/kg', 'Total Cost'],
            ...this.purchases.map(purchase => [
                new Date(purchase.date).toLocaleDateString(),
                purchase.quantity,
                `$${purchase.pricePerKg.toFixed(2)}`,
                `$${purchase.totalCost.toFixed(2)}`
            ]),
            [''],
            ['Purchase Summary'],
            ['Total Purchases', this.purchases.length],
            ['Total Cost', `$${report.totalExpense}`],
            ['']
        ];

        const csvContent = [
            [`Financial Report (${new Date().toLocaleDateString()})`],
            ['Period:', `${this.startDate || 'All time'} to ${this.endDate || 'Present'}`],
            [''],
            ...summary,
            ...salesSection,
            ...purchaseSection
        ].map(row => row.join(','))
        .join('\n');

        // Generate CSV content and download
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `detailed_financial_report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    getCategoryTotals() {
        const totals = {};
        this.orders.forEach(order => {
            if (!totals[order.productCategory]) {
                totals[order.productCategory] = {
                    units: 0,
                    revenue: 0
                };
            }
            totals[order.productCategory].units += order.quantity;
            totals[order.productCategory].revenue += order.totalPrice;
        });
        return totals;
    }
}