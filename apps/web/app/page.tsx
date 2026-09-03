import { SiteHeader } from '@/components/layout/site-header';
import { HomeView } from '@/components/objects/home-view';
import { LoadErrorAlert } from '@/components/objects/load-error-alert';
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
        {loadError ? <LoadErrorAlert /> : <HomeView initialObjects={objects} />}
      </main>
    </>
  );
}
