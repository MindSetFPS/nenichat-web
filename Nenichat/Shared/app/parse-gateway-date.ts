/**
 * Parses a date value coming from the WhatsApp gateway. Handles RFC3339/ISO strings
 * and epoch seconds or milliseconds, and returns null when the value is missing or
 * unparseable. Never fabricates a date, so callers can tell "unknown" from a real time.
 */
export function parseGatewayDate(value: unknown): Date | null {
    if (value === null || value === undefined) return null;

    const raw = String(value).trim();
    if (raw === '') return null;

    const date = /^\d+$/.test(raw)
        ? new Date(raw.length <= 10 ? Number(raw) * 1000 : Number(raw))
        : new Date(raw);

    return Number.isNaN(date.getTime()) ? null : date;
}
