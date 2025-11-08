'use client';
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function SellPage() {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sanitize = (name: string) =>
    name.normalize('NFKD').replace(/[^\w.\-]+/g, '_');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!title || price === '' || Number(price) < 0) {
      setMsg('제목/가격 확인');
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      let image_path: string | null = null;
      if (file) {
        const safe = sanitize(file.name);
        const key = `${user.id}/${Date.now()}-${safe}`;
        const { error: upErr } = await supabase
          .storage.from('item-images')
          .upload(key, file, { contentType: file.type });
        if (upErr) throw upErr;
        image_path = key;
      }

      const { error: insErr } = await supabase.from('items').insert({
        seller_id: user.id,     // ← 테이블 컬럼 이름에 맞춤
        title,
        price: Number(price),
        image_path
      });
      if (insErr) throw insErr;

      setMsg('등록 완료!');
      setTitle(''); setPrice(''); setFile(null);
    } catch (err: any) {
      setMsg(`에러: ${err.message || String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-xl mb-4">상품 등록</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input className="border px-3 py-2" placeholder="제목"
          value={title} onChange={(e)=>setTitle(e.target.value)} required />
        <input className="border px-3 py-2" type="number" min={0} placeholder="가격(원)"
          value={price} onChange={(e)=>setPrice(e.target.value===''?'':Number(e.target.value))} required />
        <input className="border px-3 py-2" type="file" accept="image/*"
          onChange={(e)=>setFile(e.target.files?.[0] ?? null)} />
        <button disabled={loading} className="border px-4 py-2">
          {loading ? '등록 중…' : '등록'}
        </button>
      </form>
      {msg && <p className="mt-3">{msg}</p>}
    </main>
  );
}
