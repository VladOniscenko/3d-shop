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
