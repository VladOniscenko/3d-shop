export interface Filament {
  id: string;
  name: string; // e.g., PLA, PETG
  material: string;
  color: string;
  pricePerGram: number;
  stockQuantity?: number;
  inStock?: boolean;
  description?: string;
}

export interface StepItem {
  number: number;
  title: string;
  desc: string;
  icon: React.ReactNode;
}

export interface PrintItem {
  name: string;
  bgColor: string;
  icon: React.ReactNode;
}

export interface GalleryItem {
  id: number;
  name: string;
  category: string;
  bgColor: string;
  icon: React.ReactNode;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
}

export interface Product {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  fileUrl: string;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  status:
    | "pending_quote"
    | "quoted"
    | "pending_payment"
    | "printing"
    | "completed"
    | "shipped"
    | "sent"
    | "delivered"
    | "paid"
    | "failed"
    | "cancelled";
  orderType: "quote" | "online";

  // Shipping Address (New)
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  phoneNumber: string;

  deliveryPrice?: number;
  quotedPrice?: number;
  quoteMessage?: string;
  trackingCode?: string;
  trackingUrl?: string;
  internalNotes?: string;
  customerNotes?: string;
  isPaid?: boolean;
  updatedAt?: string;
  createdAt: string; // Dates from JSON come back as strings
  items: OrderItem[]; // The list of 3D models
}

export interface OrderItem {
  id?: string;
  orderId?: string;
  productId?: string;
  imageUrl: string;
  fileUrl?: string;
  fileName: string;
  notes?: string;
  material: string;
  color: string;
  price: number;
  count: number;
}

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  imageUrl: string;
  material: string;
  color: string;
  count: number;
  price: number;
}

export interface Cart {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  items: CartItem[];
}

export interface CartContextType {
  cart: CartItem[];
  loading: boolean;
  error: string | null;
  addToCart: (
    productId: string,
    count: number,
    material: string,
    color: string,
  ) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateCartItem: (
    itemId: string,
    count?: number,
    material?: string,
    color?: string,
  ) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}
