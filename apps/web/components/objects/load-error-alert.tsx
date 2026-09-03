'use client';

import { motion } from 'framer-motion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTranslation } from '@/lib/i18n/language-context';

export function LoadErrorAlert() {
  const { t } = useTranslation();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Alert variant="destructive">
        <AlertTitle>{t('home.loadError')}</AlertTitle>
        <AlertDescription>{t('home.loadErrorDescription')}</AlertDescription>
      </Alert>
    </motion.div>
  );
}
