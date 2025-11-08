'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SellPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // 로그인 필수 가드
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/auth');
        return;
      }
      setReady(true);
    })();
  }, [router]);

  if (!ready) return <main className="p-6">확인 중…</main>;

  const sanitize = (n:string)=> n.normalize('NFKD').replace(/[^\w.\-]+/g,'_');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    const { data:{ user } } = await supabase.auth.getUser();
    if (!user) { router.replace('/auth'); return; }

    let image_path: string | null = null;
    if (file) {
      const key = `${user.id}/${Date.now()}-${sanitize(file.name)}`;
      const { error: upErr } = await supabase.storage.from('item-images').upload(key, file, { contentType: file.type });
      if (upErr) { setMsg(upErr.message); return; }
      image_path = key;
    }

    const { error: insErr } = await supabase.from('items').insert({
      seller_id: user.id, title, price: Number(price), image_path
    });
    if (insErr) { setMsg(insErr.message); return; }

    //  등록 후 홈으로
    router.replace('/');
  };

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-xl mb-4">상품 등록</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input className="border px-3 py-2" placeholder="제목" value={title} onChange={(e)=>setTitle(e.target.value)} required />
        <input className="border px-3 py-2" type="number" min={0} placeholder="가격(원)" value={price}
               onChange={(e)=>setPrice(e.target.value===''?'':Number(e.target.value))} required />
        <input className="border px-3 py-2" type="file" accept="image/*" onChange={(e)=>setFile(e.target.files?.[0] ?? null)} />
        <button className="border px-4 py-2">등록</button>
      </form>
      {msg && <p className="mt-3">{msg}</p>}
    </main>
  );
}
