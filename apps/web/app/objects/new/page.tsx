import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { SiteHeader } from '@/components/layout/site-header';
import { ObjectForm } from '@/components/objects/object-form';

export default function NewObjectPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-xl px-6 py-10">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to objects
        </Link>
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">New Object</h1>
        <ObjectForm />
      </main>
    </>
  );
}
