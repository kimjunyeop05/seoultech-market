'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Item = { id: string; title: string; price: number; description: string | null; image_path: string | null; created_at: string; };

function publicUrl(path: string | null) {
  if (!path) return null;
  const { data } = supabase.storage.from('item-images').getPublicUrl(path);
  return data.publicUrl;
}

export default function ItemDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('items')
        .select('id,title,price,description,image_path,created_at')
        .eq('id', id)
        .single();
      setItem((data as Item) ?? null);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <main className="p-6">불러오는 중…</main>;
  if (!item)   return <main className="p-6">존재하지 않는 물건입니다.</main>;

  const img = publicUrl(item.image_path);

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="aspect-square bg-gray-100 overflow-hidden">
          {img
            ? <img src={img} alt={item.title} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center opacity-60">이미지 없음</div>}
        </div>
        <div>
          <h1 className="text-2xl font-semibold mb-2">{item.title}</h1>
          <div className="text-xl mb-4">{item.price.toLocaleString()} 원</div>
          <div className="whitespace-pre-wrap leading-relaxed">{item.description || '(설명 없음)'}</div>
          <div className="mt-6 text-sm opacity-70">등록일: {new Date(item.created_at).toLocaleString()}</div>
        </div>
      </div>
    </main>
  );
}
