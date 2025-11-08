'use client';
import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthCallback() {
  useEffect(() => {
    (async () => {
      if (typeof window === 'undefined') return;

      // 1) 해시 토큰(#access_token, #refresh_token) 처리
      const hash = window.location.hash;
      if (hash) {
        const qs = new URLSearchParams(hash.slice(1));
        const access_token  = qs.get('access_token');
        const refresh_token = qs.get('refresh_token');
        if (access_token && refresh_token) {
          await supabase.auth.setSession({ /* @ts-ignore */ access_token, refresh_token });
          const url = new URL(window.location.href);
          url.hash = '';
          window.location.replace(url.toString() || '/');
          return;
        }
      }

      // 2) 코드 교환(?code=...) 처리
      const search = new URLSearchParams(window.location.search);
      const code = search.get('code');
      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
        const url = new URL(window.location.href);
        url.searchParams.delete('code');
        url.searchParams.delete('state');
        window.location.replace(url.toString() || '/');
      }
    })();
  }, []);

  return null;
}
