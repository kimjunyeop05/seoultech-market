'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Item = {
  id: string;
  title: string;
  price: number;
  // description: string | null; // ← 테이블에 없으므로 제외
  image_path: string | null;
  created_at: string;
};

type Comment = {
  id: string;
  author_id: string;
  author_email: string | null;
  content: string;
  created_at: string;
};

function publicUrl(path: string | null) {
  if (!path) return null;
  const { data } = supabase.storage.from('item-images').getPublicUrl(path);
  return data.publicUrl;
}

export default function ItemDetailClient({ id }: { id: string }) {
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  const [comments, setComments] = useState<Comment[]>([]);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);

  // 1) 아이템 + 세션 로드
  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const [itRes, sess] = await Promise.all([
        supabase
          .from('items')
          .select('id,title,price,image_path,created_at') //  description 제거
          .eq('id', id)
          .maybeSingle(),
        supabase.auth.getSession(),
      ]);

      setItem((itRes.data as Item) ?? null);
      setSessionUserId(sess.data?.session?.user?.id ?? null);
      setSessionEmail(sess.data?.session?.user?.email ?? null);
      setLoading(false);
    })();
  }, [id]);

  // 2) 댓글 목록
  async function loadComments() {
    if (!id) return;
    const { data } = await supabase
      .from('comments')
      .select('id,author_id,author_email,content,created_at')
      .eq('item_id', id)
      .order('created_at', { ascending: true });
    setComments((data as Comment[]) ?? []);
  }
  useEffect(() => {
    loadComments();
  }, [id]);

  // 3) 댓글 작성
  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!sessionUserId) {
      location.href = '/auth';
      return;
    }
    if (!id || !text.trim()) return;

    setPosting(true);
    const { error } = await supabase.from('comments').insert({
      item_id: id,
      author_id: sessionUserId,
      author_email: sessionEmail,
      content: text.trim(),
    });
    setPosting(false);

    if (error) {
      alert('댓글 실패: ' + error.message);
      return;
    }
    setText('');
    loadComments();
  }

  // 4) 렌더
  if (!id) return <main className="p-6">잘못된 경로입니다.</main>;
  if (loading) return <main className="p-6">불러오는 중…</main>;
  if (!item) return <main className="p-6">존재하지 않는 물건입니다.</main>;

  const img = publicUrl(item.image_path);

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="aspect-square bg-gray-100 overflow-hidden">
          {img ? (
            <img src={img} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-60">
              이미지 없음
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-semibold mb-2">{item.title}</h1>
          <div className="text-xl mb-4">{item.price.toLocaleString()} 원</div>
          {/* description 컬럼이 없으므로 기본 문구 표시 */}
          <div className="whitespace-pre-wrap leading-relaxed">(설명 없음)</div>
          <div className="mt-6 text-sm opacity-70">
            등록일: {new Date(item.created_at).toLocaleString()}
          </div>
        </div>
      </div>

      {/* 댓글 */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold mb-3">댓글</h2>

        <form onSubmit={submitComment} className="flex gap-2 mb-4">
          <input
            className="border px-3 py-2 flex-1"
            placeholder={sessionUserId ? '댓글을 입력하세요' : '로그인 후 댓글 작성 가능'}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={!sessionUserId || posting}
          />
          <button className="border px-4 py-2 disabled:opacity-60" disabled={!sessionUserId || posting}>
            {posting ? '작성 중…' : '등록'}
          </button>
        </form>

        {comments.length === 0 ? (
          <div className="opacity-70">첫 댓글을 남겨보세요.</div>
        ) : (
          <ul className="flex flex-col gap-3">
            {comments.map((c) => (
              <li key={c.id} className="border p-3">
                <div className="text-sm opacity-70 mb-1">
                  {c.author_email ?? '익명'} · {new Date(c.created_at).toLocaleString()}
                </div>
                <div className="whitespace-pre-wrap">{c.content}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
