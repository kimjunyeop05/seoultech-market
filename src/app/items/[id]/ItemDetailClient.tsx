'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

type Item = {
  id: string;
  title: string;
  price: number;
  description: string | null;
  image_path: string | null;
  created_at: string;
  seller_id: string;      // ★ 추가
  is_sold: boolean;       // ★ 추가
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
  const router = useRouter();

  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  const [comments, setComments] = useState<Comment[]>([]);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);

  const [text, setText] = useState('');
  const [posting, setPosting] = useState(false);

  // 아이템 수정용 상태 (작성자일 때만 표시)
  const [editMode, setEditMode] = useState(false);
  const [eTitle, setETitle] = useState('');
  const [ePrice, setEPrice] = useState<number | ''>('');
  const [eDesc, setEDesc] = useState('');
  const [togglingSold, setTogglingSold] = useState(false);
  const [deletingItem, setDeletingItem] = useState(false);

  // 댓글 수정/삭제용
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  // 1) 아이템 + 세션 로드
  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const [itRes, sess] = await Promise.all([
        supabase
          .from('items')
          .select('id,title,price,description,image_path,created_at,seller_id,is_sold') // ★ 필드 추가
          .eq('id', id)
          .maybeSingle(),
        supabase.auth.getSession(),
      ]);
      const it = (itRes.data as Item) ?? null;
      setItem(it);

      const uid = sess.data?.session?.user?.id ?? null;
      setSessionUserId(uid);
      setSessionEmail(sess.data?.session?.user?.email ?? null);

      // 수정폼 초기값
      if (it) {
        setETitle(it.title);
        setEPrice(it.price);
        setEDesc(it.description ?? '');
      }

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
  useEffect(() => { loadComments(); }, [id]);

  // 3) 댓글 작성
  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!sessionUserId) { location.href = '/auth'; return; }
    if (!id || !text.trim()) return;

    setPosting(true);
    const { error } = await supabase.from('comments').insert({
      item_id: id,
      author_id: sessionUserId,
      author_email: sessionEmail,
      content: text.trim(),
    });
    setPosting(false);

    if (error) { alert('댓글 실패: ' + error.message); return; }
    setText('');
    loadComments();
  }

  // 4) 댓글 삭제
  async function deleteComment(commentId: string) {
    if (!sessionUserId) { location.href = '/auth'; return; }
    setDeletingCommentId(commentId);
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    setDeletingCommentId(null);
    if (error) { alert('삭제 실패: ' + error.message); return; }
    loadComments();
  }

  // 5) 댓글 수정 시작/취소/저장
  function startEditComment(c: Comment) {
    setEditingCommentId(c.id);
    setEditingCommentText(c.content);
  }
  function cancelEditComment() {
    setEditingCommentId(null);
    setEditingCommentText('');
  }
  async function saveEditComment() {
    if (!editingCommentId || !editingCommentText.trim()) return;
    const { error } = await supabase
      .from('comments')
      .update({ content: editingCommentText.trim() })
      .eq('id', editingCommentId);
    if (error) { alert('수정 실패: ' + error.message); return; }
    cancelEditComment();
    loadComments();
  }

  // 6) 아이템 수정 저장 (작성자만)
  async function saveItemEdit() {
    if (!item || !sessionUserId || sessionUserId !== item.seller_id) return;
    if (!eTitle || ePrice === '') { alert('제목/가격을 입력하세요.'); return; }

    const { error } = await supabase
      .from('items')
      .update({
        title: eTitle,
        price: Number(ePrice),
        description: eDesc,
      })
      .eq('id', item.id);
    if (error) { alert('수정 실패: ' + error.message); return; }

    setItem({ ...item, title: eTitle, price: Number(ePrice), description: eDesc });
    setEditMode(false);
  }

  // 7) 거래완료 토글 (작성자만)
  async function toggleSold() {
    if (!item || !sessionUserId || sessionUserId !== item.seller_id) return;
    setTogglingSold(true);
    const { error } = await supabase
      .from('items')
      .update({ is_sold: !item.is_sold })
      .eq('id', item.id);
    setTogglingSold(false);
    if (error) { alert('상태 변경 실패: ' + error.message); return; }
    setItem({ ...item, is_sold: !item.is_sold });
  }

  // 8) 아이템 삭제 (작성자만)
  async function deleteItem() {
    if (!item || !sessionUserId || sessionUserId !== item.seller_id) return;
    if (!confirm('정말로 이 게시물을 삭제할까요?')) return;
    setDeletingItem(true);
    const { error } = await supabase.from('items').delete().eq('id', item.id);
    setDeletingItem(false);
    if (error) { alert('삭제 실패: ' + error.message); return; }
    alert('삭제되었습니다.');
    // 목록으로 이동
    router.push('/');
  }

  // 9) 렌더
  if (!id) return <main className="p-6">잘못된 경로입니다.</main>;
  if (loading) return <main className="p-6">불러오는 중…</main>;
  if (!item) return <main className="p-6">존재하지 않는 물건입니다.</main>;

  const img = publicUrl(item.image_path);
  const mine = sessionUserId && item.seller_id === sessionUserId;

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="aspect-square bg-gray-100 overflow-hidden relative">
          {img ? (
            <img src={img} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-60">
              이미지 없음
            </div>
          )}
          {item.is_sold && (
            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              거래완료
            </div>
          )}
        </div>

        <div>
          {!editMode ? (
            <>
              <h1 className="text-2xl font-semibold mb-2 flex items-center gap-2">
                {item.title}
                {item.is_sold && <span className="text-xs bg-gray-200 px-2 py-1 rounded">거래완료</span>}
              </h1>
              <div className="text-xl mb-4">{item.price.toLocaleString()} 원</div>
              <div className="whitespace-pre-wrap leading-relaxed">
                {item.description && item.description.trim().length > 0 ? item.description : '(설명 없음)'}
              </div>
              <div className="mt-6 text-sm opacity-70">
                등록일: {new Date(item.created_at).toLocaleString()}
              </div>

              {mine && (
                <div className="flex gap-2 mt-4">
                  <button className="border px-3 py-2" onClick={() => setEditMode(true)}>수정</button>
                  <button className="border px-3 py-2" onClick={toggleSold} disabled={togglingSold}>
                    {togglingSold ? '처리 중…' : item.is_sold ? '거래완료 해제' : '거래완료 표시'}
                  </button>
                  <button className="border px-3 py-2 text-red-600" onClick={deleteItem} disabled={deletingItem}>
                    {deletingItem ? '삭제 중…' : '삭제'}
                  </button>
                </div>
              )}
            </>
          ) : (
            // 수정 폼
            <div className="border p-3 rounded">
              <div className="mb-2">
                <input
                  className="border px-3 py-2 w-full"
                  placeholder="제목"
                  value={eTitle}
                  onChange={(e) => setETitle(e.target.value)}
                />
              </div>
              <div className="mb-2">
                <input
                  className="border px-3 py-2 w-full"
                  type="number"
                  min={0}
                  placeholder="가격"
                  value={ePrice}
                  onChange={(e) => setEPrice(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>
              <div className="mb-2">
                <textarea
                  className="border px-3 py-2 w-full"
                  rows={4}
                  placeholder="설명"
                  value={eDesc}
                  onChange={(e) => setEDesc(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button className="border px-3 py-2" onClick={saveItemEdit}>저장</button>
                <button className="border px-3 py-2" onClick={() => setEditMode(false)}>취소</button>
              </div>
            </div>
          )}
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
            onChange={(e)=>setText(e.target.value)}
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
            {comments.map(c => {
              const mineC = c.author_id === sessionUserId;
              const editing = editingCommentId === c.id;
              return (
                <li key={c.id} className="border p-3">
                  <div className="text-sm opacity-70 mb-2 flex items-center gap-2">
                    <span>{c.author_email ?? '익명'}</span>
                    <span>· {new Date(c.created_at).toLocaleString()}</span>
                    {mineC && !editing && (
                      <span className="ml-auto flex gap-3">
                        <button className="text-xs underline" onClick={() => startEditComment(c)}>수정</button>
                        <button
                          className="text-xs text-red-600 underline"
                          onClick={() => deleteComment(c.id)}
                          disabled={deletingCommentId === c.id}
                        >
                          {deletingCommentId === c.id ? '삭제 중…' : '삭제'}
                        </button>
                      </span>
                    )}
                  </div>

                  {!editing ? (
                    <div className="whitespace-pre-wrap">{c.content}</div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        className="border px-2 py-1 flex-1"
                        value={editingCommentText}
                        onChange={(e)=>setEditingCommentText(e.target.value)}
                      />
                      <button className="border px-2 py-1" onClick={saveEditComment}>저장</button>
                      <button className="border px-2 py-1" onClick={cancelEditComment}>취소</button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
