'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

function getPublicUrl(path: string | null) {
  if (!path) return null;
  const { data } = supabase.storage.from('item-images').getPublicUrl(path);
  return data.publicUrl;
}

export default function SellPage() {
  const router = useRouter();
  const [me, setMe] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [desc, setDesc] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  // 로그인 체크
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user?.id ?? null;
      setMe(uid);
      if (!uid) router.replace('/auth');
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!me) return;
    if (!title || !price || !file) {
      alert('제목/가격/이미지를 입력하세요.');
      return;
    }
    setBusy(true);

    // 1) 이미지 업로드
    const path = `${me}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase
      .storage.from('item-images')
      .upload(path, file, { cacheControl: '3600', upsert: false });
    if (upErr) {
      setBusy(false);
      alert('이미지 업로드 실패: ' + upErr.message);
      return;
    }

    // 2) DB insert
    const { error: dbErr, data } = await supabase
      .from('items')
      .insert({
        seller_id: me,                   // RLS: auth.uid() = seller_id
        title,
        price: Number(price),
        description: desc,
        image_path: path,
      })
      .select('id')
      .single();

    setBusy(false);

    if (dbErr) {
      alert('등록 실패: ' + dbErr.message);
      return;
    }

    alert('등록 완료!');
    router.push(`/items/${data.id}`); // 상세로 이동
  }

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">물건 등록</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          className="border px-3 py-2"
          placeholder="제목"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          className="border px-3 py-2"
          type="number"
          min={0}
          placeholder="가격(원)"
          value={price}
          onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
        />
        <textarea
          className="border px-3 py-2"
          placeholder="설명"
          rows={4}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
        <input
          className="border px-3 py-2"
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        <button
          disabled={busy}
          className="border px-4 py-2 disabled:opacity-60"
        >
          {busy ? '등록 중…' : '등록하기'}
        </button>
      </form>

      {/* 미리보기 (선택) */}
      {file && (
        <div className="mt-4 text-sm opacity-70">
          업로드 예정: {file.name}
        </div>
      )}
    </main>
  );
}
