import { SiteHeader } from '@/components/layout/site-header';
import { ObjectList } from '@/components/objects/object-list';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { fetchObjects } from '@/lib/api';

export default async function HomePage() {
  let objects: Awaited<ReturnType<typeof fetchObjects>> = [];
  let loadError = false;

  try {
    objects = await fetchObjects();
  } catch {
    loadError = true;
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Objects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your objects effortlessly.
          </p>
        </div>

        {loadError ? (
          <Alert variant="destructive">
            <AlertTitle>Unable to load objects.</AlertTitle>
            <AlertDescription>
              The API might be unreachable. Please try again shortly.
            </AlertDescription>
          </Alert>
        ) : (
          <ObjectList initialObjects={objects} />
        )}
      </main>
    </>
  );
}
