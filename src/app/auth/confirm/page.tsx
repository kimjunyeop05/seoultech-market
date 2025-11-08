'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic'; // 프리렌더 막기

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function ConfirmInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const [msg, setMsg] = useState('로그인 확인 중…');

  useEffect(() => {
    (async () => {
      try {
        try {
          // URL 전체로 교환
          // @ts-ignore
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (error) throw error;
          setMsg('완료! 이동합니다…');
          router.replace('/');
          return;
        } catch {}

        const code = sp.get('code');
        if (code) {
          // @ts-ignore
          const { error } = await supabase.auth.exchangeCodeForSession({ code });
          if (error) throw error;
          setMsg('완료! 이동합니다…');
          router.replace('/');
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session) { router.replace('/'); return; }

        setMsg('유효한 인증 정보가 없습니다.');
      } catch (e: any) {
        setMsg(e?.message ?? '인증 실패');
      }
    })();
  }, [router, sp]);

  return <p style={{ padding: 16 }}>{msg}</p>;
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={<p style={{ padding: 16 }}>로그인 확인 중…</p>}>
      <ConfirmInner />
    </Suspense>
  );
}
