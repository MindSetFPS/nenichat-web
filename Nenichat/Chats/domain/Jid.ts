/**
 * Represents the different types of WhatsApp identifiers.
 */
export type JidKind = 'contact' | 'group' | 'lid' | 'unknown';

/**
 * Detects the kind of JID based on its suffix.
 * 
 * @param {string} jid - The JID string to analyze.
 * @returns {JidKind} The kind of JID detected.
 */
export function getJidKind(jid: string): JidKind {
    if (!jid) return 'unknown';

    if (jid.endsWith('@s.whatsapp.net')) {
        return 'contact';
    }

    if (jid.endsWith('@g.us')) {
        return 'group';
    }

    if (jid.endsWith('@lid')) {
        return 'lid';
    }

    return 'unknown';
}

export function jidIsPhoneNumber(jid: string): boolean {
    return getJidKind(jid) === 'contact';
}

export function jidIsGroup(jid: string): boolean {
    return getJidKind(jid) === 'group';
}

export function jidIsLid(jid: string): boolean {
    return getJidKind(jid) === 'lid';
}

/**
 * Extracts the numeric part (phone number) from a JID.
 * Removes the suffix and any device identifiers (e.g. 521...:1@s.whatsapp.net -> 521...)
 */
export function jidToNumeric(jid: string): string {
    return jid.split('@')[0].split(':')[0];
}

/**
 * Checks if a string is a formatted WhatsApp JID.
 */
export function isJid(jid: string): boolean {
    return jid.includes('@');
}