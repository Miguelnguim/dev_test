'use client';

import { useCallback, useRef, useState, type DragEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createObject } from '@/lib/api';
import { useTranslation } from '@/lib/i18n/language-context';
import { cn } from '@/lib/utils';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function ObjectForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const applyFile = useCallback(
    (file: File | undefined) => {
      setError(null);

      if (!file) {
        setPreview(null);
        return;
      }

      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(t('form.errorInvalidType'));
        setPreview(null);
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(t('form.errorTooLarge'));
        setPreview(null);
        return;
      }

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
      }

      setPreview(URL.createObjectURL(file));
    },
    [t],
  );

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    applyFile(event.target.files?.[0]);
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    applyFile(event.dataTransfer.files?.[0]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setError(null);
    const formEl = event.currentTarget;
    const formData = new FormData(formEl);
    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      setError(t('form.errorRequiredImage'));
      return;
    }

    setIsSubmitting(true);
    try {
      await createObject(formData);
      toast.success(t('form.success'));
      formEl.reset();
      setPreview(null);
      router.push('/');
    } catch {
      setError(t('form.error'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {error && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">{t('form.titleLabel')}</Label>
        <Input
          id="title"
          name="title"
          required
          maxLength={100}
          placeholder={t('form.titlePlaceholder')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">{t('form.descriptionLabel')}</Label>
        <Textarea
          id="description"
          name="description"
          required
          maxLength={1000}
          placeholder={t('form.descriptionPlaceholder')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">{t('form.imageLabel')}</Label>
        <label
          htmlFor="image"
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'flex aspect-[4/3] w-full max-w-sm cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-dashed text-sm transition-colors',
            isDragging
              ? 'border-primary bg-accent/60'
              : 'border-border/70 bg-background/40 text-muted-foreground hover:bg-accent/40',
          )}
        >
          {preview ? (
            <Image
              src={preview}
              alt="Preview"
              width={400}
              height={300}
              className="h-full w-full object-cover"
              unoptimized
            />
          ) : (
            <>
              <UploadCloud className="size-6" />
              <span>{isDragging ? t('form.dropzoneActive') : t('form.dropzoneHint')}</span>
              <span className="text-xs">{t('form.dropzoneConstraints')}</span>
            </>
          )}
        </label>
        <Input
          ref={fileInputRef}
          id="image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
          required
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? t('form.submitting') : t('form.submit')}
      </Button>
    </motion.form>
  );
}
