'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { ObjectForm } from './object-form';
import { useTranslation } from '@/lib/i18n/language-context';
import type { HeyamaObject } from '@/types/object';

export function EditObjectView({ object }: { object: HeyamaObject }) {
  const { t } = useTranslation();

  return (
    <>
      <Link
        href={`/objects/${object.id}`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {t('detail.backToObjects')}
      </Link>
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 text-2xl font-semibold tracking-tight"
      >
        {t('editForm.title')}
      </motion.h1>
      <ObjectForm object={object} />
    </>
  );
}
