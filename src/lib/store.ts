import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  login: string;
  role: 'Student' | 'Visor' | 'Admin';
  fullName: string | null;
  expertMode: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  imageUrl: string | null;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Card {
  id: string;
  owner: string;
  number: string;
  date: string;
  cvv: string;
  balance: number;
  isBuggy: boolean;
}

interface ShopState {
  // Auth
  user: User | null;
  token: string | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  
  // UI State
  currentView: 'login' | 'shop' | 'profile' | 'admin' | 'admin-login';
  showCart: boolean;
  
  // Data
  products: Product[];
  categories: Record<string, Product[]>;
  cartItems: CartItem[];
  cards: Card[];
  cartSum: number;
  cartTotalItems: number;
  
  // Settings
  popupDuration: number;
  
  // Admin data
  users: User[];
  loginLogs: any[];
  visorLogs: any[];
  
  // Actions
  setUser: (user: User | null, token?: string, isAdmin?: boolean) => void;
  logout: () => void;
  setView: (view: 'login' | 'shop' | 'profile' | 'admin' | 'admin-login') => void;
  toggleCart: () => void;
  setProducts: (products: Product[], categories: Record<string, Product[]>) => void;
  setCart: (items: CartItem[], sum: number, totalItems: number) => void;
  setCards: (cards: Card[]) => void;
  setPopupDuration: (duration: number) => void;
  setAdminData: (data: { users?: User[]; loginLogs?: any[]; visorLogs?: any[] }) => void;
  removeProductFromLocal: (productId: string) => void;
}

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAdmin: false,
      isAuthenticated: false,
      currentView: 'login' as const,
      showCart: false,
      products: [],
      categories: {},
      cartItems: [],
      cards: [],
      cartSum: 0,
      cartTotalItems: 0,
      popupDuration: 1,
      users: [],
      loginLogs: [],
      visorLogs: [],
      
      // Actions
      setUser: (user, token, isAdmin = false) => set({ 
        user, 
        token: token || null,
        isAdmin,
        isAuthenticated: !!user,
        currentView: user ? (isAdmin ? 'admin' : 'shop') : 'login',
      }),
      
      logout: () => set({ 
        user: null, 
        token: null, 
        isAdmin: false,
        isAuthenticated: false,
        currentView: 'login',
        cartItems: [],
        cartSum: 0,
        cartTotalItems: 0,
        cards: [],
      }),
      
      setView: (currentView) => set({ currentView }),
      
      toggleCart: () => set((state) => ({ showCart: !state.showCart })),
      
      setProducts: (products, categories) => set({ products, categories }),
      
      setCart: (cartItems, cartSum, cartTotalItems) => set({ 
        cartItems, 
        cartSum, 
        cartTotalItems 
      }),
      
      setCards: (cards) => set({ cards }),
      
      setPopupDuration: (popupDuration) => set({ popupDuration }),
      
      setAdminData: (data) => set((state) => ({ 
        ...state, 
        ...data 
      })),
      
      removeProductFromLocal: (productId) => set((state) => ({
        products: state.products.filter(p => p.id !== productId),
        categories: Object.fromEntries(
          Object.entries(state.categories).map(([cat, prods]) => [
            cat,
            prods.filter(p => p.id !== productId)
          ]).filter(([_, prods]) => (prods as Product[]).length > 0)
        ),
      })),
    }),
    {
      name: 'qa-training-shop',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAdmin: state.isAdmin,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
