export class SalesReport {
    constructor(orders, startDate = null, endDate = null, taxRate = 0.18) {
        this.orders = orders;
        this.startDate = startDate;
        this.endDate = endDate;
        this.taxRate = taxRate;
        this.totalRevenue = 0;
        this.taxAmount = 0;
        this.netRevenue = 0;
        this.unitsSoldByCategory = {};
        this.revenueByCategory = {};
        this.generateReport();
    }

    generateReport() {
        this.orders
            .filter(order => this.isInDateRange(order.orderDate))
            .forEach(order => {
                this.unitsSoldByCategory[order.productCategory] = 
                    (this.unitsSoldByCategory[order.productCategory] || 0) + order.quantity;

                this.revenueByCategory[order.productCategory] = 
                    (this.revenueByCategory[order.productCategory] || 0) + order.totalPrice;

                this.totalRevenue += order.totalPrice;
            });

        this.taxAmount = this.totalRevenue * this.taxRate;
        this.netRevenue = this.totalRevenue - this.taxAmount;
    }


    isInDateRange(orderDate) {
        const date = new Date(orderDate);
        date.setHours(0, 0, 0, 0);
        return (!this.startDate || date >= this.startDate) && 
               (!this.endDate || date <= this.endDate);
    }
    
    exportToCSV() {
        const headers = ['Category', 'Units Sold', 'Revenue'];
        const rows = Object.keys(this.unitsSoldByCategory).map(category => [
            category,
            this.unitsSoldByCategory[category],
            this.revenueByCategory[category].toFixed(2)
        ]);
        rows.push(['Total', '', this.totalRevenue.toFixed(2)]);
        
        return [headers, ...rows]
            .map(row => row.join(','))
            .join('\n');
    }
}