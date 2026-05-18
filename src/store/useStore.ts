import { create } from 'zustand';

interface Product {
  id: number;
  name: string;
  brand: string;
  price: number;
  discount: number;
  image: string;
  images?: string[];
  category: string;
  rating: number;
  stock: number;
  description: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface StoreState {
  cart: CartItem[];
  wishlist: Product[];
  token: string | null;
  user: User | null;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (product: Product) => void;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useStore = create<StoreState>((set) => ({
  cart: [],
  wishlist: [],
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  addToCart: (product) => set((state) => {
    const existing = state.cart.find((item) => item.id === product.id);
    if (existing) {
      return {
        cart: state.cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ),
      };
    }
    return { cart: [...state.cart, { ...product, quantity: 1 }] };
  }),
  removeFromCart: (productId) => set((state) => ({
    cart: state.cart.filter((item) => item.id !== productId),
  })),
  updateQuantity: (productId, quantity) => set((state) => ({
    cart: state.cart.map((item) =>
      item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
    ),
  })),
  clearCart: () => set({ cart: [] }),
  toggleWishlist: (product) => set((state) => {
    const exists = state.wishlist.find((item) => item.id === product.id);
    if (exists) {
      return { wishlist: state.wishlist.filter((item) => item.id !== product.id) };
    }
    return { wishlist: [...state.wishlist, product] };
  }),
  setAuth: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null, cart: [], wishlist: [] });
  },
}));
