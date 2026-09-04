'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DeleteObjectDialog } from './delete-object-dialog';
import { useTranslation } from '@/lib/i18n/language-context';
import type { HeyamaObject } from '@/types/object';

export function ObjectDetailView({ object }: { object: HeyamaObject }) {
  const { t, language } = useTranslation();
  const router = useRouter();
  const locale = language === 'fr' ? 'fr-FR' : 'en-US';

  const formattedCreatedAt = new Date(object.createdAt).toLocaleDateString(locale);
  const wasEdited =
    object.updatedAt && new Date(object.updatedAt).getTime() > new Date(object.createdAt).getTime();
  const formattedUpdatedAt = wasEdited
    ? new Date(object.updatedAt).toLocaleDateString(locale)
    : null;

  return (
    <>
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {t('detail.backToObjects')}
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="overflow-hidden rounded-2xl border border-border/60 bg-card/70 shadow-sm backdrop-blur-xl"
      >
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
              {t('detail.createdOn', { date: formattedCreatedAt })}
              {formattedUpdatedAt && ` · ${t('detail.editedOn', { date: formattedUpdatedAt })}`}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/objects/${object.id}/edit`}>
                <Pencil />
                {t('card.edit')}
              </Link>
            </Button>
            <DeleteObjectDialog
              id={object.id}
              title={object.title}
              onDeleted={() => {
                router.push('/');
                router.refresh();
              }}
            />
          </div>
        </div>
      </motion.div>
    </>
  );
}
