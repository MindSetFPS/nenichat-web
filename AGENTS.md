# AGENTS.md - Nenichat Web Development Guidelines

This file contains essential information for agentic coding agents working on this Next.js 16 application.

## Development Commands

### Core Commands
- `npm run dev` - Start development server on port 5102 with webpack
- `npm run build` - Build for production with OpenNext Cloudflare integration
- `npm run start` - Start production server on port 5101
- `npm run lint` - Run ESLint checks
- `npm run test` - Run Jest test suite
- `npm run preview` - Preview Cloudflare build locally

### Cloudflare Commands
- `npm run deploy` - Build and deploy to Cloudflare Workers
- `npm run cf-typegen` - Generate Cloudflare environment types

### Running Single Tests
```bash
# Run specific test file
npm test -- repository/__tests__/ProductRepository.test.ts

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Project Structure

### Core Directories
- `app/` - Next.js App Router pages and API routes
- `components/` - React components organized by feature
- `lib/` - Utility functions and shared logic
- `repository/` - Database repository classes
- `hooks/` - Custom React hooks
- `styles/` - Global styles and Tailwind configuration

### Key Files
- `tsconfig.json` - TypeScript configuration with strict mode enabled
- `jest.config.ts` - Jest testing configuration with TypeScript support
- `eslint.config.mjs` - ESLint with Next.js recommended rules

## Code Style Guidelines

### Imports
- Use absolute imports with `@/` prefix for all internal modules
- Third-party imports first, then internal imports, then type imports
- Sort imports alphabetically within each group

```typescript
// Third-party
import { useEffect, useState } from "react";
import { NextRequest, NextResponse } from 'next/server';

// Internal
import { Button } from "@/components/ui/button";
import { requireAuth } from "@/lib/auth";

// Types
import type { IProduct } from "@/dto/IProduct";
```

### TypeScript & Types
- Always use TypeScript strict mode
- Define interfaces for all data structures
- Use `type` for utility types, `interface` for object shapes
- Prefer explicit return types for functions

```typescript
interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[],
    filterMode?: "column" | "global"
}

export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
    // implementation
}
```

### Component Structure
- Use functional components with React hooks
- Client components start with `"use client"` directive
- Server components are async by default when needed
- Props interfaces defined above components

```typescript
"use client"

interface ButtonProps {
    variant?: "default" | "destructive" | "outline"
    size?: "default" | "sm" | "lg"
    children: React.ReactNode
}

export function Button({ variant = "default", size = "default", children }: ButtonProps) {
    return <button className={cn(buttonVariants({ variant, size }))}>{children}</button>
}
```

### Naming Conventions
- Components: PascalCase (e.g., `DataTable`, `ProductForm`)
- Functions: camelCase (e.g., `formatCurrency`, `requireAuth`)
- Variables: camelCase with descriptive names
- Constants: UPPER_SNAKE_CASE for global constants
- Files: kebab-case for components, PascalCase for utilities

```typescript
// Constants
const DEFAULT_PAGE_SIZE = 10;

// Functions
export function getProductImageUrl(path: string): string {
    return path;
}

// Components
export function ProductTable({ products }: ProductTableProps) {
    // implementation
}
```

### Error Handling
- Use try-catch blocks for async operations
- Return proper HTTP status codes in API routes
- Log errors with console.error for debugging
- Use proper error boundaries in React components

```typescript
export async function POST(request: NextRequest) {
    try {
        const { phone, message } = await request.json();
        
        if (!phone || !message) {
            return NextResponse.json({ error: 'Missing phone or message' }, { status: 400 });
        }

        await SendMessage(phone, message);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in send message API:', error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}
```

### Styling Guidelines
- Use Tailwind CSS classes for all styling
- Leverage `cn()` utility from `@/lib/utils` for conditional classes
- Use CSS variables for colors and spacing defined in `styles/globals.css`
- Apply responsive design with mobile-first approach

```typescript
import { cn } from "@/lib/utils"

export function Button({ className, variant, size, ...props }) {
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center rounded-md text-sm font-medium",
                buttonVariants({ variant, size }),
                className
            )}
            {...props}
        />
    )
}
```

### Testing Patterns
- Use Jest with TypeScript support
- Write descriptive test descriptions using `describe` and `it`
- Use `beforeAll`, `afterAll`, `beforeEach`, `afterEach` for setup/teardown
- Mock external dependencies when testing in isolation
- Use transactions for database tests and rollback after each test

```typescript
describe('ProductRepository', () => {
    let productRepository: ProductRepository;
    let client: Pool;

    beforeAll(async () => {
        client = new Pool({ connectionString: process.env.DATABASE_URL });
        productRepository = new ProductRepository(client);
    });

    beforeEach(async () => {
        await client.query('BEGIN');
    });

    afterEach(async () => {
        await client.query('ROLLBACK');
    });

    it('should return all products', async () => {
        const products = await productRepository.getAll();
        expect(products).toHaveLength(2);
    });
});
```

### API Route Patterns
- Export named HTTP methods (GET, POST, PUT, DELETE)
- Use TypeScript for request/response types
- Validate input data before processing
- Return JSON responses with appropriate status codes
- Handle authentication with `requireAuth()` for protected routes

### Database Patterns
- Use repository pattern for data access
- Keep queries in repository classes, not in API routes
- Use parameterized queries to prevent SQL injection
- Handle null values appropriately in TypeScript

### UI Component Guidelines
- Use Radix UI primitives for accessibility
- Implement variants using `class-variance-authority` (cva)
- Support dark mode through CSS variables
- Use forwardRef for components that need ref forwarding
- Include proper TypeScript props with `React.ComponentProps`

## Key Dependencies & Patterns

### Authentication
- Supabase SSR for server-side authentication
- `requireAuth()` helper for protected server components
- Server and client Supabase clients in `lib/supabase/`

### State Management
- Zustand for global state management
- React hooks for local component state
- URL params for route-specific state

### Form Handling
- Server actions for form submissions
- Client-side validation when needed
- Proper error display and loading states

### Development Notes
- This is a Next.js 16 application with App Router
- Uses OpenNext for Cloudflare deployment
- Tailwind CSS v4 with custom CSS variables for theming
- TypeScript strict mode enabled
- ESLint with Next.js core web vitals configuration