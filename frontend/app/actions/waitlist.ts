'use server'

import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function addToWaitlist(prevState: any, formData: FormData) {
    const text = formData.get('contact') as string;

    if (!text) {
        return { error: 'Por favor ingresa un correo o teléfono.', success: false };
    }

    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Allow phone numbers with optional +, spaces, dashes, and 10-15 digits
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;

    const isEmail = emailRegex.test(text);
    const isPhone = phoneRegex.test(text);

    if (!isEmail && !isPhone) {
        return { error: 'Por favor ingresa un correo electrónico o número de teléfono válido.', success: false };
    }

    try {
        const cookieStore = await cookies();
        if (cookieStore.get('waitlist_joined')) {
            return { success: true, message: 'Ya te has unido al pre-registro.' };
        }

        // Insert into DB using Supabase
        const { error } = await supabase
            .from('preregister')
            .insert({ contact: text });

        if (error) {
            console.error('Supabase error:', error);
            throw new Error(error.message);
        }

        cookieStore.set('waitlist_joined', 'true', { maxAge: 60 * 60 * 24 * 365 });

        return { success: true };
    } catch (error: any) {
        console.error('Waitlist error:', error);
        return { error: 'Hubo un error al unirte a la lista. Por favor, inténtalo más tarde.', success: false };
    }
}
