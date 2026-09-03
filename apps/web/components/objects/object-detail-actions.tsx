'use client';

import { useRouter } from 'next/navigation';
import { DeleteObjectDialog } from './delete-object-dialog';

export function ObjectDetailActions({ id, title }: { id: string; title: string }) {
  const router = useRouter();

  return (
    <DeleteObjectDialog
      id={id}
      title={title}
      onDeleted={() => {
        router.push('/');
        router.refresh();
      }}
    />
  );
}
