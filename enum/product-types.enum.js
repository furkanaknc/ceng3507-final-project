// Product types for inventory management
export const ProductType = Object.freeze({
    RAW: 'RAW',
    FROZEN: 'FROZEN',
    FRESH: 'FRESH',
    ORGANIC: 'ORGANIC'
});

// Check if given type exists in ProductType enum
export function isValidProductType(type) {
    return Object.values(ProductType).includes(type);
}