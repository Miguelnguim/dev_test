'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DeleteObjectDialog } from './delete-object-dialog';
import { useTranslation } from '@/lib/i18n/language-context';
import type { HeyamaObject } from '@/types/object';

export function ObjectCard({
  object,
  onDeleted,
}: {
  object: HeyamaObject;
  onDeleted?: () => void;
}) {
  const { t } = useTranslation();

  return (
    <Card className="group flex h-full flex-col overflow-hidden pt-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <Image
          src={object.imageUrl}
          alt={object.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>
      <CardHeader>
        <CardTitle className="truncate">{object.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="line-clamp-2 text-sm text-muted-foreground">{object.description}</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/objects/${object.id}`}>{t('card.view')}</Link>
        </Button>
        <DeleteObjectDialog id={object.id} title={object.title} onDeleted={onDeleted} />
      </CardFooter>
    </Card>
  );
}
