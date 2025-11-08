'use client';
import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthHashCatcher() {
  useEffect(() => {
    (async () => {
      if (typeof window === 'undefined' || !window.location.hash) return;
      const qs = new URLSearchParams(window.location.hash.slice(1));
      const access_token = qs.get('access_token');
      const refresh_token = qs.get('refresh_token');
      if (access_token && refresh_token) {
        await supabase.auth.setSession({ /* @ts-ignore */ access_token, refresh_token });
        const url = new URL(window.location.href);
        url.hash = '';
        window.location.replace(url.toString() || '/');
      }
    })();
  }, []);
  return null;
}
