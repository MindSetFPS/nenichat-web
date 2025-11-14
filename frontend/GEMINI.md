## General Instructions

- When you generate new TypeScript code, follow the existing coding style.
- Ensure all new functions and classes have JSDoc comments.
- We are using Next JS v15, we are using app router, we must always be aware when we create a client vs a server components, it's rules and behaviours.

## Coding Style

- Always use strict equality (`===` and `!==`).
- Use { params: Promise<{ id: string }> } in route.js parameters definition 