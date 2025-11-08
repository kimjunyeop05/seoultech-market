'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ConfirmPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const [msg, setMsg] = useState('로그인 처리 중…');

  useEffect(() => {
    (async () => {
      try {
        const code = sp.get('code');
        if (code) {
          // supabase-js 버전별 시그니처 차이 대응
          try {
            // @ts-ignore
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) throw error;
          } catch {
            // @ts-ignore
            const { error } = await supabase.auth.exchangeCodeForSession({ code });
            if (error) throw error;
          }
          setMsg('완료! 이동합니다…');
          router.replace('/');
          return;
        }
        // 해시 방식(#access_token=...)도 대응
        if (typeof window !== 'undefined' && window.location.hash) {
          const params = new URLSearchParams(window.location.hash.slice(1));
          const access_token = params.get('access_token');
          const refresh_token = params.get('refresh_token');
          if (access_token && refresh_token) {
            const { error } = await supabase.auth.setSession({
              // @ts-ignore
              access_token, refresh_token
            });
            if (error) throw error;
            setMsg('완료! 이동합니다…');
            router.replace('/');
            return;
          }
        }
        setMsg('유효한 인증 정보가 없습니다.');
      } catch (e: any) {
        setMsg(e?.message ?? '인증 실패');
      }
    })();
  }, [router, sp]);

  return <p style={{ padding: 16 }}>{msg}</p>;
}
