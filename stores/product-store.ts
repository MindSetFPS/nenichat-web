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

    /**
     * Fetches products from the API and sets them in the store.
     * @param active_only - If true, only active products are fetched.
     * @param limit - The maximum number of products to fetch.
     * @returns A promise that resolves when the products are fetched.
     */
    fetchProducts: (active_only?: boolean, limit?: number) => Promise<void>;
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

    fetchProducts: async (active_only: boolean = false, limit: number = 100) => {
        set({ isLoading: true, error: null });
        try {
            const response = await fetch(`/api/products?active_only=${active_only}&limit=${limit}`);
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            const data = await response.json();
            set({ products: data.sort((a: IProduct, b: IProduct) => a.name.localeCompare(b.name)), isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },
}));
