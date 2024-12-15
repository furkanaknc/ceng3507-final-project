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

    getFinancialReport() {
        return {
            totalIncome: this.totalIncome.toFixed(2),
            totalExpense: this.totalExpense.toFixed(2),
            taxAmount: this.taxAmount.toFixed(2),
            netProfit: this.netProfit.toFixed(2),
            profitMargin: ((this.netProfit / this.totalIncome) * 100).toFixed(2)
        };
    }
}