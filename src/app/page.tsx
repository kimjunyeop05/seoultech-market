'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
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

type OrderKey = 'latest' | 'priceAsc' | 'priceDesc';

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [keyword, setKeyword] = useState('');
  const [order, setOrder] = useState<OrderKey>('latest');
  const [loading, setLoading] = useState(true);

  async function fetchItems() {
    setLoading(true);
    let query = supabase
      .from('items')
      .select('id,title,price,image_path,created_at');

    // 정렬
    if (order === 'latest') query = query.order('created_at', { ascending: false });
    if (order === 'priceAsc') query = query.order('price', { ascending: true });
    if (order === 'priceDesc') query = query.order('price', { ascending: false });

    const { data } = await query;
    setItems((data as Item[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchItems(); }, [order]);

  // 클라이언트에서 간단 검색(제목 기준)
  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return items;
    return items.filter(it => it.title.toLowerCase().includes(q));
  }, [items, keyword]);

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xl font-semibold mr-auto">최근 등록</h2>

        <input
          className="border px-3 py-2 w-[360px]"
          placeholder="검색(제목)"
          value={keyword}
          onChange={(e)=>setKeyword(e.target.value)}
        />

        <select
          className="border px-2 py-2"
          value={order}
          onChange={(e)=>setOrder(e.target.value as OrderKey)}
        >
          <option value="latest">최신순</option>
          <option value="priceAsc">가격↑</option>
          <option value="priceDesc">가격↓</option>
        </select>

        <Link href="/sell" className="border px-3 py-2">등록하기</Link>
      </div>

      {loading ? (
        <div>불러오는 중…</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {filtered.map((it) => {
            const img = publicUrl(it.image_path);
            return (
              <Link
                key={it.id}
                href={`/items/${it.id}`}                 //  상세 페이지로 이동
                className="border block hover:shadow-md transition"
              >
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  {img ? (
                    <img src={img} alt={it.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-60">이미지 없음</div>
                  )}
                </div>
                <div className="p-3">
                  <div className="font-medium">{it.title}</div>
                  <div className="text-sm">{it.price.toLocaleString()} 원</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
