'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function MePage() {
  const [email, setEmail] = useState<string | null>(null);
  const [raw, setRaw]   = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setEmail(session?.user?.email ?? null);
      setRaw(session);
      console.log('session', session);
    })();
  }, []);

  return (
    <main style={{ padding: 16 }}>
      <h1>/me</h1>
      <p>email: {email ?? '(로그인 안됨)'}</p>
      <pre style={{whiteSpace:'pre-wrap', background:'#f6f6f6', padding:12}}>
        {JSON.stringify(raw, null, 2)}
      </pre>
    </main>
  );
}
