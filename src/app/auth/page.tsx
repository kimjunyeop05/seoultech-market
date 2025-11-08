'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function AuthPage() {
  const [email, setEmail] = useState('');

  useEffect(() => {
    // 로그인 상태면 홈(또는 /sell)로
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.replace('/sell'); // 원하는 경로
    });
  }, []);

  return (
    <main className="p-6">
      <h1>로그인</h1>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/auth/confirm` } });
          alert('메일을 확인하세요.');
        }}
        className="flex gap-2 mt-4"
      >
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email"
          className="border px-2 py-1"
        />
        <button className="border px-3 py-1">매직링크 보내기</button>
      </form>
    </main>
  );
}
