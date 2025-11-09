const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const host = process.env.DB_HOST;
const port = process.env.DB_PORT;
const db = process.env.DB_NAME;

if (!user) throw new Error("Missing environment variable: POSTGRES_USER");
if (!password) throw new Error("Missing environment variable: POSTGRES_PASSWORD");
if (!host) throw new Error("Missing environment variable: POSTGRES_HOST");
if (!port) throw new Error("Missing environment variable: POSTGRES_PORT");
if (!db) throw new Error("Missing environment variable: POSTGRES_DB");

const connectionString = `postgres://${user}:${password}@${host}:${port}/${db}`;

export const sql = new Bun.SQL(connectionString);
