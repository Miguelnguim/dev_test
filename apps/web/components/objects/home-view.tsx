'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { getSocket } from '@/lib/socket';
import { useTranslation } from '@/lib/i18n/language-context';
import { Input } from '@/components/ui/input';
import { ObjectGrid } from './object-grid';
import type { HeyamaObject } from '@/types/object';
import { SOCKET_EVENTS } from '@/types/object';

export function HomeView({ initialObjects }: { initialObjects: HeyamaObject[] }) {
  const { t } = useTranslation();
  const [objects, setObjects] = useState<HeyamaObject[]>(initialObjects);
  const [query, setQuery] = useState('');
  const [isConnected, setIsConnected] = useState(() => getSocket().connected);

  useEffect(() => {
    const socket = getSocket();

    function handleCreated(object: HeyamaObject) {
      setObjects((current) => [object, ...current.filter((o) => o.id !== object.id)]);
    }

    function handleDeleted({ id }: { id: string }) {
      setObjects((current) => current.filter((object) => object.id !== id));
    }

    function handleConnect() {
      setIsConnected(true);
    }

    function handleDisconnect() {
      setIsConnected(false);
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on(SOCKET_EVENTS.OBJECT_CREATED, handleCreated);
    socket.on(SOCKET_EVENTS.OBJECT_DELETED, handleDeleted);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off(SOCKET_EVENTS.OBJECT_CREATED, handleCreated);
      socket.off(SOCKET_EVENTS.OBJECT_DELETED, handleDeleted);
    };
  }, []);

  const filteredObjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return objects;

    return objects.filter(
      (object) =>
        object.title.toLowerCase().includes(normalizedQuery) ||
        object.description.toLowerCase().includes(normalizedQuery),
    );
  }, [objects, query]);

  function handleDeleted(id: string) {
    setObjects((current) => current.filter((object) => object.id !== id));
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{t('home.title')}</h1>
            <span className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card/50 px-2.5 py-1 text-xs text-muted-foreground backdrop-blur-sm">
              <span
                className={`size-1.5 rounded-full ${
                  isConnected ? 'bg-emerald-500' : 'bg-zinc-400'
                }`}
              >
                {isConnected && (
                  <span className="block size-1.5 animate-ping rounded-full bg-emerald-500" />
                )}
              </span>
              {isConnected ? t('home.live') : t('home.offline')}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{t('home.subtitle')}</p>
        </div>

        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('home.searchPlaceholder')}
            className="pl-9"
          />
        </div>
      </motion.div>

      <ObjectGrid
        objects={filteredObjects}
        isFiltered={query.trim().length > 0}
        onDeleted={handleDeleted}
      />
    </>
  );
}
