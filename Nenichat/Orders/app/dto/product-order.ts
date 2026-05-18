import { z } from 'zod';

export const ProductOrderSchema = z.object({
    productName: z.string().describe('The name of the product ordered'),
    amount: z.number().int().positive().describe('The quantity of the product'),
});

export const ProductOrderListSchema = z.object({
    orders: z.array(ProductOrderSchema)
        .describe('Array of product orders extracted from the conversation'),
});

export type ProductOrder = z.infer<typeof ProductOrderSchema>;
