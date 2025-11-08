'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LogoutPage() {
  const router = useRouter();
  useEffect(() => {
    (async () => {
      await supabase.auth.signOut();
      router.replace('/');
    })();
  }, [router]);
  return <p style={{ padding: 16 }}>로그아웃 중…</p>;
}
