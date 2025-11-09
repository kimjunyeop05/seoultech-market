'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

type Item = {
  id: string;
  title: string;
  price: number;
  image_path: string | null;
  created_at: string;
};

function publicUrl(path: string | null) {
  if (!path) return null;
  const { data } = supabase.storage.from('item-images').getPublicUrl(path);
  return data.publicUrl;
}

export default function HomePage() {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchItems(keyword = '') {
    setLoading(true);
    let query = supabase
      .from('items')
      .select('id,title,price,image_path,created_at')
      .order('created_at', { ascending: false });

    if (keyword) {
      query = query.ilike('title', `%${keyword}%`);
    }

    const { data, error } = await query;
    if (!error && data) setItems(data as Item[]);
    setLoading(false);
  }

  useEffect(() => {
    fetchItems();
  }, []);

  const list = useMemo(
    () =>
      items.map((it) => ({
        ...it,
        thumb: publicUrl(it.image_path),
      })),
    [items]
  );

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">최근 등록</h1>
        <Link href="/sell" className="underline">등록하기</Link>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          className="border px-3 py-2 flex-1"
          placeholder="검색(제목)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchItems(q)}
        />
        <button className="border px-4" onClick={() => fetchItems(q)}>검색</button>
      </div>

      {loading ? (
        <div>불러오는 중…</div>
      ) : list.length === 0 ? (
        <div>등록된 물건이 없습니다.</div>
      ) : (
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {list.map((it) => (
            <li key={it.id} className="border p-2">
              <Link href={`/items/${it.id}`}>
                <div className="aspect-square bg-gray-100 mb-2 overflow-hidden">
                  {it.thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.thumb} alt={it.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm opacity-60">
                      이미지 없음
                    </div>
                  )}
                </div>
                <div className="font-medium">{it.title}</div>
                <div className="text-sm opacity-70">{it.price.toLocaleString()} 원</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
