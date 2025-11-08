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
  const [msg, setMsg] = useState('로그인 확인 중…');

  useEffect(() => {
    (async () => {
      try {
        // 1) 최신 gotrue는 현재 URL에서 자동으로 code를 읽음
        try {
          // @ts-ignore - 다양한 시그니처 대응
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (error) throw error;
          setMsg('완료! 이동합니다…');
          router.replace('/');
          return;
        } catch (_) {
          /* 무시하고 아래 분기 시도 */
        }

        // 2) 쿼리스트링 ?code=... 버전
        const code = sp.get('code');
        if (code) {
          try {
            // @ts-ignore
            const { error } = await supabase.auth.exchangeCodeForSession({ code });
            if (error) throw error;
            setMsg('완료! 이동합니다…');
            router.replace('/');
            return;
          } catch (_) {
            // continue
          }
        }

        // 3) 해시 #access_token=... 버전 (일부 브라우저/설정)
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

        // 4) 이미 세션이 생긴 경우(새로고침 등)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          router.replace('/');
          return;
        }

        setMsg('유효한 인증 정보가 없습니다.');
      } catch (e: any) {
        setMsg(e?.message ?? '인증 실패');
      }
    })();
  }, [router, sp]);

  return <p style={{ padding: 16 }}>{msg}</p>;
}
