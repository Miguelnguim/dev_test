'use client';

import { useEffect, useState } from 'react';
import { PackageOpen } from 'lucide-react';
import { getSocket } from '@/lib/socket';
import { ObjectCard } from './object-card';
import { Skeleton } from '@/components/ui/skeleton';
import type { HeyamaObject } from '@/types/object';
import { SOCKET_EVENTS } from '@/types/object';

export function ObjectList({ initialObjects }: { initialObjects: HeyamaObject[] }) {
  const [objects, setObjects] = useState<HeyamaObject[]>(initialObjects);

  useEffect(() => {
    const socket = getSocket();

    function handleCreated(object: HeyamaObject) {
      setObjects((current) => [object, ...current.filter((o) => o.id !== object.id)]);
    }

    function handleDeleted({ id }: { id: string }) {
      setObjects((current) => current.filter((object) => object.id !== id));
    }

    socket.on(SOCKET_EVENTS.OBJECT_CREATED, handleCreated);
    socket.on(SOCKET_EVENTS.OBJECT_DELETED, handleDeleted);

    return () => {
      socket.off(SOCKET_EVENTS.OBJECT_CREATED, handleCreated);
      socket.off(SOCKET_EVENTS.OBJECT_DELETED, handleDeleted);
    };
  }, []);

  if (objects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 py-24 text-center">
        <PackageOpen className="size-8 text-muted-foreground" />
        <p className="font-medium">No objects yet.</p>
        <p className="text-sm text-muted-foreground">Create your first object to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {objects.map((object) => (
        <ObjectCard
          key={object.id}
          object={object}
          onDeleted={() => setObjects((current) => current.filter((o) => o.id !== object.id))}
        />
      ))}
    </div>
  );
}

export function ObjectListSkeleton() {
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
