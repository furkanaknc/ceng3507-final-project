export const ProductType = Object.freeze({
    RAW: 'RAW',
    FROZEN: 'FROZEN',
    FRESH: 'FRESH',
    ORGANIC: 'ORGANIC'
});

// Add helper function to validate product type
export function isValidProductType(type) {
    return Object.values(ProductType).includes(type);
}