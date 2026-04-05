export interface Filament {
  id: string;
  name: string;
  material: string;
  color: string;
  pricePerGram: number;
  stockQuantity?: number;
  inStock?: boolean;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  productType?: "print" | "filament" | "other";
  category: string;
  imageUrl: string;
  images?: string[];
  fileUrl: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  hasDiscount?: boolean;
  isActive?: boolean;
  trackInventory?: boolean;
  stockQuantity?: number;
  inStock?: boolean;
}
