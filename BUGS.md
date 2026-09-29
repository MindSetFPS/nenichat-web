# Bug Tracker

## Open Bugs

| ID | Priority | Status | Description | Steps to Reproduce | Expected | Actual | File(s) |
|----|----------|--------|-------------|---------------------|----------|--------|---------|
| 3 | P1 | Open | Recent chats show empty contact names on prod build | 1. Production build 2. Load chats list | All contact names display | Some names empty on first load; show after clicking contact and returning | `components/chat/recent-chats.tsx`, `components/chat/chat-item.tsx`, `components/contact-initializer.tsx` |
| 4 | P1 | Open | Orders list shows contact ID instead of name | 1. Production build 2. Load orders list | Contact name displays | Sometimes shows `#123` (contact_id) instead of name | `components/orders/contact-name-cell.tsx` |
| 5 | P1 | Open | Editing an order silently overwrites `payment_status` with `paid` | 1. Open an order whose `amount_paid` equals `total_amount` but is marked `refunded` (or `unpaid`) 2. Open its edit page 3. Save without touching the payment select | Stored payment status is preserved unless the operator changes it | `effectivePaymentStatus` forces `"paid"` when `totalAmount === amountPaid && totalAmount > 0`, so the select shows "Pagado" and the update writes it back | `components/forms/order-form.tsx` |
| 6 | P2 | Open | Paid amount cannot be viewed or edited unless status is "Parcial" | 1. Open an order with `amount_paid > 0` whose status is `unpaid` or `paid` 2. Look for the amount field | Operator can always see and correct the amount paid | "Importe pagado" input only renders when `effectivePaymentStatus === "partial"` | `components/forms/order-form.tsx` |
| 7 | P2 | Open | An order with no items cannot be saved | 1. Open an order with no line items 2. Change status, notes or shipping 3. Try to save | Status/notes/shipping can be saved | Submit is `disabled` when `totalAmount === 0` and no reason is shown | `components/forms/order-form.tsx` |
| 8 | P2 | Open | Contact "Deuda"/"Cobrado" ignore refunds | 1. Refund an order belonging to a contact 2. Open that contact | Debt reflects the refund | `debt = totalPurchased - totalPaid`; `refunded_amount` is never subtracted, while the order page does subtract it | `components/contacts/contact-detail.tsx` |
| 9 | P2 | Open | "Ventas" counts unpaid/cancelled orders and only the last 30 days, but reads as a lifetime total | 1. Open /products 2. Compare the Ventas column against actual paid sales | Column states what it measures | Query filters only `orders.created_at >= now - 1 month`; no `status` or `payment_status` filter, so unpaid, undelivered and cancelled orders all count | `Nenichat/Products/infra/persistance/SupabaseProductRepository.ts` |
| 10 | P2 | Open | Home dashboard displays fabricated trend badges | 1. Open /home 2. Look at the "Ingresos Totales" and "Pedidos Totales" cards | Trend reflects real period-over-period change | `trend="+12.5%"` and `trend="+8.2%"` are hardcoded strings | `components/home/business-summary.tsx` |
| 11 | P2 | Open | Home dashboard issues one contact query per outstanding order | 1. Open /home with many unpaid orders | One batched query | `Promise.all(outstandingOrders.map(...findById))` runs a query per order | `app/(app)/home/page.tsx` |
| 12 | P2 | Open | Product images never render | 1. Have rows in `product_images` for a product 2. Open /products or that product's page | Images display | Every `product_images` join is commented out, so `mapToProduct` always returns `images: []` | `Nenichat/Products/infra/persistance/SupabaseProductRepository.ts` |
| 13 | P2 | Open | "Ir al chat" link is wrong for LID-only contacts | 1. Open a contact that has a `lid` but no `phone_number` 2. Click "Ir al chat" | Opens the correct chat | The phone-or-LID value is passed to `phoneNumberToJid()`, which appends `@s.whatsapp.net` even to a LID (should be `@lid`) | `components/contacts/contact-detail.tsx`, `app/(app)/orders/[orderNumber]/page.tsx` |
| 14 | P3 | Open | Order edit stock validation includes inactive products | 1. Deactivate a product 2. Open an order edit page 3. Select that product | Only active products are selectable, as on create | Create passes active products, edit passes all `products` | `components/forms/order-form.tsx` |
| 15 | P3 | Open | Order edit discards unsaved changes silently | 1. Change fields on the edit page 2. Click Cancelar or navigate away | Warn before discarding | "Cancelar" calls `window.history.back()` with no dirty-state guard | `components/forms/order-form.tsx`, `components/forms/edit-order-form.tsx` |
| 16 | P3 | Open | Home is the only app route without a `layout.tsx` | 1. Compare /home with /products, /orders | Route group provides `Content` via a layout | `app/(app)/home/page.tsx` renders `Content` itself with custom padding and background classes | `app/(app)/home/page.tsx` |
| 17 | P3 | Open | Home "Ventas del día" is fed product aggregates named `ordersToday` | 1. Open /home | Naming matches the data | `getOrdersCountByDate()` returns `{ product_name, count }[]` (products sold), passed down as `ordersToday` | `app/(app)/home/page.tsx`, `components/home/business-summary.tsx`, `components/home/orders-pie-chart.tsx` |
| 18 | P3 | Open | `DailyOrdersChart` mutates a module-level `chartConfig` during render | 1. Render the chart | Config is derived, never mutated | `chartConfig[item.name] = {...}` writes to a module-scope object from inside the component body | `components/home/orders-pie-chart.tsx` |
| 19 | P3 | Open | Contact summary totals (all-time) disagree with its orders table (this month) | 1. Open /contacts/[id] | Tiles and table describe the same period | Tiles sum every order; the table defaults to `selectedDateDefault="this-month"` | `components/contacts/contact-detail.tsx` |
| 20 | P3 | Open | Column visibility dropdown shows raw column ids instead of header labels | 1. Open any table 2. Open the "Columnas" menu | Labels match the table headers | Uses `column.id` ("units sold") rather than the header ("Ventas"), and `replace("_", " ")` only replaces the first underscore | `components/data-table.tsx` |
| 21 | P3 | Open | `middleware` file convention is deprecated | 1. Run `next build` | No deprecation warning | Next 16 warns to rename `middleware.ts` to `proxy.ts` | `middleware.ts` |

---

## Fixed Bugs

| ID | Priority | Description | Fixed In | File(s) |
|----|----------|-------------|----------|---------|
| 1 | P1 | Recent chats show wrong contact names | 2026-09-02 | `components/chat/recent-chats.tsx` |
| 2 | P1 | Orders list shows wrong contact names | 2026-09-02 | `app/(app)/orders/page.tsx`, `components/orders/table/columns.tsx` |
