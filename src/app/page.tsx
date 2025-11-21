// src/app/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Item = {
  id: string;
  title: string;
  price: number;
  image_path: string | null;
  created_at: string;
};

function publicUrl(path: string | null) {
  if (!path) return null;
  const { data } = supabase.storage.from("item-images").getPublicUrl(path);
  return data.publicUrl;
}

type OrderKey = "latest" | "priceAsc" | "priceDesc";

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [keyword, setKeyword] = useState("");
  const [order, setOrder] = useState<OrderKey>("latest");
  const [loading, setLoading] = useState(true);

  async function fetchItems() {
    setLoading(true);
    let query = supabase.from("items").select("id,title,price,image_path,created_at");

    if (order === "latest") query = query.order("created_at", { ascending: false });
    if (order === "priceAsc") query = query.order("price", { ascending: true });
    if (order === "priceDesc") query = query.order("price", { ascending: false });

    const { data } = await query;
    setItems((data as Item[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchItems();
  }, [order]);

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => it.title.toLowerCase().includes(q));
  }, [items, keyword]);

  return (
    <main className="p-6 max-w-6xl mx-auto">
      {/* 상단 바 */}
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xl font-semibold mr-auto">최근 등록</h2>

        <input
          className="border rounded-lg px-3 py-2 w-[360px] focus:outline-none focus:ring-2 focus:ring-black/10"
          placeholder="검색(제목)"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <select
          className="border rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
          value={order}
          onChange={(e) => setOrder(e.target.value as OrderKey)}
        >
          <option value="latest">최신순</option>
          <option value="priceAsc">가격 낮은순</option>
          <option value="priceDesc">가격 높은순</option>
        </select>

        <Link
          href="/sell"
          className="rounded-lg px-4 py-2 bg-black text-white hover:bg-black/90 transition-colors"
        >
          등록하기
        </Link>
      </div>

      {/* 리스트 / 로딩 */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl border bg-white overflow-hidden">
              <div className="aspect-square bg-gray-100 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-1/3 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-gray-500 py-20">검색 결과가 없습니다.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((it) => {
            const img = publicUrl(it.image_path);
            const isNew = Date.now() - new Date(it.created_at).getTime() < 1000 * 60 * 60 * 48; // 48h
            return (
              <Link
                key={it.id}
                href={`/items/${it.id}`}
                className="group rounded-2xl border bg-white shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 overflow-hidden"
              >
                <div className="aspect-square bg-gray-50">
                  {img ? (
                    <img
                      src={img}
                      alt={it.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      이미지 없음
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold text-gray-900 truncate">{it.title}</h3>
                    {isNew && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                        NEW
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-[15px] font-bold tracking-tight">
                    {it.price.toLocaleString()}
                    <span className="text-gray-500 text-[13px] ml-0.5">원</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
