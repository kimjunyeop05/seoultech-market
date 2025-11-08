'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('메일 전송 중…');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm` }
    });
    setMsg(error ? `에러: ${error.message}` : '로그인 링크를 메일로 보냈습니다.');
  };

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-xl mb-3">이메일 로그인</h1>
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border px-3 py-2 flex-1"
        />
        <button type="submit" className="border px-4 py-2">로그인 링크 받기</button>
      </form>
      {msg && <p className="mt-3">{msg}</p>}
    </main>
  );
}
