import { create } from 'zustand';
import { IProduct } from '@/Nenichat/Products/domain/IProduct';

interface ProductState {
    products: IProduct[];
    isLoading: boolean;
    error: string | null;

    // Actions
    setProducts: (products: IProduct[]) => void;
    addProduct: (product: IProduct) => void;
    updateProduct: (product: IProduct) => void;
    deleteProduct: (productId: string) => void;
    fetchProducts: () => Promise<void>;
}

export const useProductStore = create<ProductState>((set) => ({
    products: [],
    isLoading: false,
    error: null,

    setProducts: (products) => set({ products }),

    addProduct: (product) =>
        set((state) => ({ products: [...state.products, product] })),

    updateProduct: (updatedProduct) =>
        set((state) => ({
            products: state.products.map((p) =>
                p.id === updatedProduct.id ? updatedProduct : p
            ),
        })),

    deleteProduct: (productId) =>
        set((state) => ({
            products: state.products.filter((p) => p.id !== productId),
        })),

    fetchProducts: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch('/api/products');
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            const data = await response.json();
            set({ products: data, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },
}));
