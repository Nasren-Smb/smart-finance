import { createClient } from "@/lib/supabase/server";

export interface AuthenticatedUser {
  id: string;
  email?: string;
}

/**
 * Memverifikasi sesi pengguna dari cookie server Supabase.
 * Mengembalikan user jika terverifikasi, atau null jika belum login / sesi tidak valid.
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
    };
  } catch {
    return null;
  }
}
