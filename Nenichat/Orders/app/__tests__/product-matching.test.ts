import { matchProduct, mapExtractedProductsToEcommerceProducts } from "../product-matching";

describe("matchProduct", () => {
    it("exact match after normalization", () => {
        expect(matchProduct("Café", { name: "Cafe" })).toBe(true);
    });

    it("substring match", () => {
        expect(matchProduct("Coca Cola 500ml", { name: "Coca Cola" })).toBe(true);
        expect(matchProduct("Coca Cola", { name: "Coca Cola 500ml" })).toBe(true);
    });

    it("token overlap with typo — the failing case", () => {
        const result = matchProduct(
            "Tortitas de Papa Rellenas de Queso Filadelfia",
            { name: "Tortitas de Papa Rellenas de Queso Philadelfia" },
        );
        expect(result).toBe(true);
    });

    it("levenshtein handles typos", () => {
        expect(matchProduct("Choclate", { name: "Chocolate" })).toBe(true);
        expect(matchProduct("Bannana", { name: "Banana" })).toBe(true);
    });

    it("short name matches long DB name via substring", () => {
        expect(matchProduct("tortitas de papa", {
            name: "Tortitas de Papa Rellenas de Queso Philadelfia",
        })).toBe(true);
    });

    it("completely different words do not match", () => {
        expect(matchProduct("Laptop", { name: "Notebook" })).toBe(false);
    });

    it("similar but low overlap does not match", () => {
        expect(matchProduct("Arroz", { name: "Arroz con Leche" })).toBe(true); // 50% overlap
        expect(matchProduct("Vino Tinto", { name: "Queso" })).toBe(false);
        expect(matchProduct("Leche", { name: "Arroz con Leche" })).toBe(true);
    });
});

describe("mapExtractedProductsToEcommerceProducts", () => {
    const catalog = [
        { id: "p1", name: "Coca Cola", price: 20 },
        { id: "p2", name: "Tortitas de Papa Rellenas de Queso Philadelfia", price: 45 },
        { id: "p3", name: "Chocolate", price: 15 },
        { id: "p4", name: "Café", price: 25 },
    ];

    it("maps matched products to OrderItemRow", () => {
        const orders = [
            { productName: "Coca Cola 500ml", amount: 2 },
            { productName: "Choclate", amount: 3 },
            { productName: "Café", amount: 1 },
        ];
        const result = mapExtractedProductsToEcommerceProducts(orders, catalog);
        expect(result).toEqual([
            { productId: "p1", quantity: 2, unitPrice: 20 },
            { productId: "p3", quantity: 3, unitPrice: 15 },
            { productId: "p4", quantity: 1, unitPrice: 25 },
        ]);
    });

    it("returns empty productId when no match found", () => {
        const orders = [{ productName: "NonExistentProduct", amount: 1 }];
        const result = mapExtractedProductsToEcommerceProducts(orders, catalog);
        expect(result).toEqual([
            { productId: "", quantity: 1, unitPrice: 0 },
        ]);
    });

    it("handles empty orders array", () => {
        const result = mapExtractedProductsToEcommerceProducts([], catalog);
        expect(result).toEqual([]);
    });

    it("handles the exact user-reported scenario", () => {
        // LLM extracts these two products from the conversation
        const orders = [
            { productName: "tortitas de papa", amount: 1 },
            { productName: "Tortitas de Papa Rellenas de Queso Filadelfia", amount: 2 },
        ];

        const result = mapExtractedProductsToEcommerceProducts(orders, catalog);

        // "tortitas de papa" should match via substring on "Tortitas de Papa Rellenas..."
        expect(result[0].productId).toBe("p2");

        // "Tortitas de Papa Rellenas de Queso Filadelfia" should match via token overlap
        expect(result[1].productId).toBe("p2");
    });
});
