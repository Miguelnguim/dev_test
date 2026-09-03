import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Heyama Objects
        </Link>
        <Button asChild size="sm">
          <Link href="/objects/new">
            <Plus />
            New Object
          </Link>
        </Button>
      </div>
    </header>
  );
}
