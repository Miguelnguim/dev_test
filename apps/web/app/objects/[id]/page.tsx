import { notFound } from 'next/navigation';
import { SiteHeader } from '@/components/layout/site-header';
import { ObjectDetailView } from '@/components/objects/object-detail-view';
import { ApiError, fetchObject } from '@/lib/api';

export default async function ObjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let object;
  try {
    object = await fetchObject(id);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
      notFound();
    }
    throw error;
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <ObjectDetailView object={object} />
      </main>
    </>
  );
}
