'use client';

import { useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createObject } from '@/lib/api';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function ObjectForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setError(null);

    if (!file) {
      setPreview(null);
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only JPEG, PNG or WEBP images are allowed.');
      event.target.value = '';
      setPreview(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError('Image must be smaller than 5 MB.');
      event.target.value = '';
      setPreview(null);
      return;
    }

    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setError(null);
    const formEl = event.currentTarget;
    const formData = new FormData(formEl);
    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      setError('Please select an image.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createObject(formData);
      toast.success('Object created successfully.');
      formEl.reset();
      setPreview(null);
      router.push('/');
    } catch {
      setError('Unable to create this object. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required maxLength={100} placeholder="MacBook Pro" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          required
          maxLength={1000}
          placeholder="Professional laptop for development work."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Image</Label>
        <label
          htmlFor="image"
          className="flex aspect-[4/3] w-full max-w-sm cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-dashed border-border/70 bg-background/40 text-sm text-muted-foreground transition-colors hover:bg-accent/40"
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
              <span>Click to upload an image</span>
              <span className="text-xs">JPEG, PNG or WEBP — max 5 MB</span>
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
        {isSubmitting ? 'Creating…' : 'Create object'}
      </Button>
    </form>
  );
}
