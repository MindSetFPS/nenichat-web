import type { ProductOrder } from "@/Nenichat/Orders/app/dto/product-order";
import type { OrderItemRow } from "@/components/forms/order-form";


// This along with the prompt is probably our moat

/**
 * Normalize a string for fuzzy comparison:
 *   - lowercase
 *   - remove diacritics/accents ("café" → "cafe")
 *   - replace punctuation with spaces ("coca-cola" → "coca cola")
 *   - collapse multiple spaces
 *   - trim
 *
 * @example
 * normalize("¡Jalapeño!")  // "jalapeno"
 * normalize("Café & Té")   // "cafe te"
 * normalize("  Coca-Cola  ") // "coca cola"
 */
function normalize(str: string): string {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{M}/gu, "")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

/**
 * Levenshtein edit distance between two strings.
 * Measures how many single-character edits (insert, delete, substitute) are needed.
 * Used as the last-resort matcher to handle typos.
 *
 * @example
 * levenshtein("chocolate", "choclate")    // 1  (missing "o")
 * levenshtein("banana", "bannana")        // 1  (extra "n")
 * levenshtein("cafe", "coffee")           // 3
 */
function levenshtein(a: string, b: string): number {
    const m = a.length;
    const n = b.length;
    const dp: number[] = Array.from({ length: n + 1 }, (_, i) => i);
    for (let i = 1; i <= m; i++) {
        let prev = dp[0];
        dp[0] = i;
        for (let j = 1; j <= n; j++) {
            const tmp = dp[j];
            dp[j] =
                a[i - 1] === b[j - 1]
                    ? prev
                    : 1 + Math.min(prev, dp[j], dp[j - 1]);
            prev = tmp;
        }
    }
    return dp[n];
}

/**
 * Match an order product name against a known product using
 * progressively looser strategies:
 *
 * 1. **Exact** (normalized)        – "Café" ↔ "cafe" (handles accents)
 * 2. **Substring** (normalized)    – "Coca Cola 500ml" ↔ "coca cola"
 * 3. **Token overlap ≥ 50%**       – "Rice White Long" ↔ "White Rice"
 * 4. **Levenshtein ratio ≥ 80%**   – "Choclate" ↔ "Chocolate" (typos)
 *
 * @example
 * matchProduct("Café",         { name: "Cafe",       price: 5 })  // true  (exact after deburr)
 * matchProduct("Choclate",     { name: "Chocolate",  price: 3 })  // true  (levenshtein 87.5%)
 * matchProduct("Coca Cola 2L", { name: "Coca Cola",  price: 2 })  // true  (substring)
 * matchProduct("White Rice",   { name: "Rice White", price: 4 })  // true  (token overlap 100%)
 * matchProduct("Laptop",       { name: "Notebook",   price: 9 })  // false (completely different)
 */
function matchProduct(
    orderName: string,
    product: { name: string },
): boolean {
    const a = normalize(orderName);
    const b = normalize(product.name);

    // 1. Exact match after normalization
    if (a === b) return true;

    // 2. Substring match (one contains the other)
    if (a.includes(b) || b.includes(a)) return true;

    // 3. Token overlap: at least 50% of the smaller token set is shared
    const aTokens = a.split(" ").filter(Boolean);
    const bTokens = b.split(" ").filter(Boolean);
    const sharedCount = aTokens.filter((t) => bTokens.includes(t)).length;
    const minLength = Math.min(aTokens.length, bTokens.length);
    if (minLength > 0 && sharedCount / minLength >= 0.5) return true;

    // 4. Levenshtein similarity ratio >= 80%
    const dist = levenshtein(a, b);
    const maxLen = Math.max(a.length, b.length);
    if (maxLen > 0 && (maxLen - dist) / maxLen >= 0.8) return true;

    return false;
}

/**
 * Map products extracted from an LLM suggestion to OrderItemRow
 * objects that the order form can consume.
 *
 * Each LLM-extracted ProductOrder is fuzzy-matched against the
 * available product catalog using {@link matchProduct}, which
 * handles accents, punctuation, word-order differences, and typos.
 *
 * Unmatched products produce an empty productId (no auto-link).
 *
 * @param orders   – products extracted from the LLM conversation
 * @param products – the available product catalog (id, name, price)
 * @returns order items ready for the order form
 *
 * @example
 * // LLM says "2 chocolate bars and 1 café"
 * const orders = [
 *   { productName: "Choclate", amount: 2 },       // typo
 *   { productName: "Café",     amount: 1 },       // accent
 * ];
 * const catalog = [
 *   { id: "p1", name: "Chocolate", price: 3 },
 *   { id: "p2", name: "Cafe",      price: 5 },
 * ];
 * mapExtractedProductsToEcommerceProducts(orders, catalog);
 * // → [
 * //     { productId: "p1", quantity: 2, unitPrice: 3 },
 * //     { productId: "p2", quantity: 1, unitPrice: 5 },
 * //   ]
 */
export function mapExtractedProductsToEcommerceProducts(
    orders: ProductOrder[],
    products: { id: string; name: string; price: number }[],
): OrderItemRow[] {
    return orders.map((order) => {
        const product = products.find((p) =>
            matchProduct(order.productName, p),
        );
        return {
            productId: product?.id ?? "",
            quantity: order.amount,
            unitPrice: product?.price ?? 0,
        };
    });
}
