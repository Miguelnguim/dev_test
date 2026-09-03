'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageToggle } from './language-toggle';
import { useTranslation } from '@/lib/i18n/language-context';

export function SiteHeader() {
  const { t } = useTranslation();

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="sticky top-0 z-40 border-b border-border/50 bg-background/60 backdrop-blur-2xl"
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          Heyama Objects
        </Link>
        <div className="flex items-center gap-1.5">
          <LanguageToggle />
          <Button asChild size="sm">
            <Link href="/objects/new">
              <Plus />
              {t('header.newObject')}
            </Link>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
