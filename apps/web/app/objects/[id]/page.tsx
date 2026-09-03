import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { SiteHeader } from '@/components/layout/site-header';
import { ObjectDetailActions } from '@/components/objects/object-detail-actions';
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
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to objects
        </Link>

        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl shadow-sm">
          <div className="relative aspect-[16/9] w-full bg-muted">
            <Image
              src={object.imageUrl}
              alt={object.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
          <div className="flex items-start justify-between gap-4 p-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{object.title}</h1>
              <p className="mt-2 text-muted-foreground">{object.description}</p>
              <p className="mt-4 text-xs text-muted-foreground">
                Created {new Date(object.createdAt).toLocaleDateString()}
              </p>
            </div>
            <ObjectDetailActions id={object.id} title={object.title} />
          </div>
        </div>
      </main>
    </>
  );
}
