'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const onSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('메일 전송 중…');
    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/auth/confirm`
        : `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://seoultech-market.vercel.app'}/auth/confirm`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    setMsg(error ? `에러: ${error.message}` : '메일을 확인하세요.');
  };

  return (
    <main className="p-6 max-w-sm mx-auto">
      <h1 className="text-xl mb-4">로그인</h1>
      <form className="flex flex-col gap-3" onSubmit={onSend}>
        <input className="border px-3 py-2" type="email" placeholder="email"
               value={email} onChange={(e)=>setEmail(e.target.value)} required />
        <button className="border px-3 py-2">매직 링크 보내기</button>
      </form>
      {msg && <p className="mt-3">{msg}</p>}
    </main>
  );
}
