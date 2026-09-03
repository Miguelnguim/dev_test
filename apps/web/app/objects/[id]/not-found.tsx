'use client';

import Link from 'next/link';
import { PackageX } from 'lucide-react';
import { SiteHeader } from '@/components/layout/site-header';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n/language-context';

export default function ObjectNotFound() {
  const { t } = useTranslation();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 py-24 text-center">
        <PackageX className="size-10 text-muted-foreground" />
        <h1 className="text-xl font-semibold">{t('notFound.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('notFound.description')}</p>
        <Button asChild size="sm">
          <Link href="/">{t('notFound.back')}</Link>
        </Button>
      </main>
    </>
  );
}
