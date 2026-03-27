export interface Filament {
  id: string;
  name: string;
  material: string;
  color: string;
  pricePerGram: number;
  stockQuantity: number;
  description: string;
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

export interface Filament {
  id: string;
  name: string; // e.g., PLA, PETG
  color: string;
  pricePerGram: number;
  inStock: boolean;
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
  status: "pending_quote" | "printing" | "shipped" | "completed" | "cancelled";

  // Shipping Address (New)
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  phoneNumber: string;

  deliveryPrice?: number;
  createdAt: string; // Dates from JSON come back as strings
  items: OrderItem[]; // The list of 3D models
}

export interface OrderItem {
  id?: string;
  orderId?: string;
  imageUrl: string;
  fileUrl?: string;
  fileName: string;
  notes?: string;
  material: string;
  color: string;
  price: number;
  count: number;
}

export interface CartContextType {
  cart: OrderItem[];
  addToCart: (item: OrderItem) => void;
  removeFromCart: (index: number) => void;
  clearCart: () => void;
}
