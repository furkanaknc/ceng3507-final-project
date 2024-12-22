// Product categories by package size
export const ProductCategory = Object.freeze({
    SMALL: 'SMALL',
    MEDIUM: 'MEDIUM',
    LARGE: 'LARGE',
    EXTRA_LARGE: 'EXTRA_LARGE',
    FAMILY_PACK: 'FAMILY_PACK',
    BULK_PACK: 'BULK_PACK',
    PREMIUM: 'PREMIUM'
});

// Standard weights (in grams) for each category
export const CategoryWeights = Object.freeze({
    SMALL: 100,
    MEDIUM: 250,
    LARGE: 500,
    EXTRA_LARGE: 1000,
    FAMILY_PACK: 2000,
    BULK_PACK: 5000
});