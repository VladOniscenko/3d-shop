export interface Filament {
  id: string;
  name: string;
  material: string;
  color: string;
  pricePerGram: number;
  stockQuantity?: number;
  inStock?: boolean;
  description?: string;
  getColorStyle: () => { backgroundColor: string; color: string };
}

export const createFilament = (
  data: Omit<Filament, "getColorStyle">,
): Filament => {
  return {
    ...data,

    getColorStyle: () => {
      const hex = data.color;

      if (!hex || hex.toLowerCase() === "transparent") {
        return { backgroundColor: "transparent", color: "#111827" };
      }

      if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex)) {
        return { backgroundColor: "#D1FAE5", color: "#111827" }; // fallback
      }

      return { backgroundColor: hex, color: getContrastYIQ(hex) };
    },
  };
};

// Helper function to compute contrast using YIQ
const getContrastYIQ = (hex: string) => {
  let r: number, g: number, b: number;

  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }

  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#111827" : "#FFFFFF";
};

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
