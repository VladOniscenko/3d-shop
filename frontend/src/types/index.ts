// --- Types ---
export interface MaterialItem {
  name: string;
  tagline: string;
  description: string;
  colorClass: string;
  icon: React.ReactNode;
  tags: string[];
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
  basePrice: number;
}

export interface Order {
  id: string;
  userId: string;
  status: "pending_quote" | "printing" | "shipped" | "delivered";
  fileUrl?: string; // If they uploaded a custom file
  notes?: string;
  totalPrice?: number; // Set after you review the quote
  createdAt: Date;
}
