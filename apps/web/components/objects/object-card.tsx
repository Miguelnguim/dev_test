import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DeleteObjectDialog } from './delete-object-dialog';
import type { HeyamaObject } from '@/types/object';

export function ObjectCard({
  object,
  onDeleted,
}: {
  object: HeyamaObject;
  onDeleted?: () => void;
}) {
  return (
    <Card className="flex flex-col overflow-hidden pt-0">
      <div className="relative aspect-[4/3] w-full bg-muted">
        <Image
          src={object.imageUrl}
          alt={object.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      <CardHeader>
        <CardTitle className="truncate">{object.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="line-clamp-2 text-sm text-muted-foreground">{object.description}</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/objects/${object.id}`}>View</Link>
        </Button>
        <DeleteObjectDialog id={object.id} title={object.title} onDeleted={onDeleted} />
      </CardFooter>
    </Card>
  );
}
