'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { PackageOpen, SearchX } from 'lucide-react';
import { ObjectCard } from './object-card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/lib/i18n/language-context';
import type { HeyamaObject } from '@/types/object';

export function ObjectGrid({
  objects,
  isFiltered,
  onDeleted,
}: {
  objects: HeyamaObject[];
  isFiltered: boolean;
  onDeleted: (id: string) => void;
}) {
  const { t } = useTranslation();

  if (objects.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-card/30 py-24 text-center backdrop-blur-sm"
      >
        {isFiltered ? (
          <>
            <SearchX className="size-8 text-muted-foreground" />
            <p className="font-medium">{t('home.noResults')}</p>
          </>
        ) : (
          <>
            <PackageOpen className="size-8 text-muted-foreground" />
            <p className="font-medium">{t('empty.title')}</p>
            <p className="text-sm text-muted-foreground">{t('empty.description')}</p>
          </>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {objects.map((object) => (
          <motion.div
            key={object.id}
            layout
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <ObjectCard object={object} onDeleted={() => onDeleted(object.id)} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

export function ObjectGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-[4/3] w-full" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  );
}
