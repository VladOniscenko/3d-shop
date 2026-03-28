import type { Product } from "../types";

export const PRODUCT_TYPES = {
  PRINT: "print",
  FILAMENT: "filament",
  OTHER: "other",
} as const;

export const PRODUCT_TYPE_LABELS: Record<string, string> = {
  [PRODUCT_TYPES.PRINT]: "3D Print",
  [PRODUCT_TYPES.FILAMENT]: "Filament",
  [PRODUCT_TYPES.OTHER]: "Other",
};

export const PRODUCT_SORT_OPTIONS = {
  NEWEST: "newest",
  PRICE_ASC: "price_asc",
  PRICE_DESC: "price_desc",
  NAME_ASC: "name_asc",
  DISCOUNT_DESC: "discount_desc",
} as const;

export const PRODUCT_DEFAULT_FILTERS = {
  CATEGORY: "all",
  TYPE: "all",
  SEARCH: "",
  DISCOUNT_ONLY: false,
  IN_STOCK_ONLY: false,
  SORT: PRODUCT_SORT_OPTIONS.NEWEST,
} as const;

export function productImages(product: Product): string[] {
  const values = [product.imageUrl, ...(product.images || [])]
    .filter(
      (url): url is string => typeof url === "string" && url.trim().length > 0,
    )
    .map((url) => url.trim());

  return Array.from(new Set(values));
}

export function productTypeLabel(productType?: string): string {
  if (!productType) return PRODUCT_TYPE_LABELS[PRODUCT_TYPES.PRINT];
  return PRODUCT_TYPE_LABELS[productType] || productType;
}

export function productPriceParts(product: Product): {
  current: number;
  original: number;
  discountPercentage: number;
  hasDiscount: boolean;
} {
  const current = Number.isFinite(product.price) ? product.price : 0;
  const original =
    Number.isFinite(product.originalPrice) && (product.originalPrice || 0) > 0
      ? (product.originalPrice as number)
      : current;
  const discountPercentage =
    Number.isFinite(product.discountPercentage) &&
    (product.discountPercentage || 0) > 0
      ? (product.discountPercentage as number)
      : 0;

  const hasDiscount =
    Boolean(product.hasDiscount) ||
    discountPercentage > 0 ||
    original > current;

  return {
    current,
    original,
    discountPercentage,
    hasDiscount,
  };
}

export function productInventoryParts(product: Product): {
  trackInventory: boolean;
  stockQuantity: number;
  inStock: boolean;
} {
  const trackInventory = Boolean(product.trackInventory);
  const stockQuantity = Math.max(0, product.stockQuantity || 0);
  const inStock = trackInventory ? stockQuantity > 0 : true;

  return {
    trackInventory,
    stockQuantity,
    inStock,
  };
}
