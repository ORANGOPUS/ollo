import type { H3Event } from 'h3';
import { serverSupabaseUser } from '#supabase/server';

// serverSupabaseUser() throws its own (500-status) error when there's no
// session instead of returning null; normalize that into a proper 401 so
// callers can rely on the auth check without also handling that library
// quirk everywhere.
export async function requireUser(event: H3Event) {
    let user;
    try {
        user = await serverSupabaseUser(event);
    } catch {
        user = null;
    }
    if (!user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }
    return user;
}
