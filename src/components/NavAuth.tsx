'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function NavAuth() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    // 최초 세션 로드
    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user?.email ?? null);
    });
    // 로그인/로그아웃 이벤트에 반응
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setEmail(session?.user?.email ?? null);
      router.refresh(); // 헤더 재렌더링
    });
    return () => sub.subscription.unsubscribe();
  }, [router]);

  if (email) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm opacity-70">{email}</span>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.push('/'); // 로그아웃 후 홈
          }}
          className="underline"
        >
          로그아웃
        </button>
      </div>
    );
  }
  return <Link href="/auth" className="underline">로그인</Link>;
}
