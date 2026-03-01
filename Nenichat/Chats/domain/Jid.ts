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
