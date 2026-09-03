'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { SiteHeader } from '@/components/layout/site-header';
import { ObjectForm } from '@/components/objects/object-form';
import { useTranslation } from '@/lib/i18n/language-context';

export default function NewObjectPage() {
  const { t } = useTranslation();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-xl px-6 py-10">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {t('form.backToObjects')}
        </Link>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-2xl font-semibold tracking-tight"
        >
          {t('form.newObjectTitle')}
        </motion.h1>
        <ObjectForm />
      </main>
    </>
  );
}
