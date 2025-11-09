import ItemDetailClient from './ItemDetailClient';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next 16: params가 Promise라서 반드시 await로 꺼내야 함
  const { id } = await params;

  // 여기서 받은 id를 클라이언트 컴포넌트로 넘김
  return <ItemDetailClient id={id} />;
}
