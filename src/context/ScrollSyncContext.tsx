import React, { createContext, useContext, useMemo, useRef } from 'react';

type Position = { top: number; left: number };
type Limits = { top: number; left: number };

type Listener = (args: { position: Position; maxScroll: Limits }) => void;

interface ScrollSyncAPI {
  register: (id: string, listener: Listener) => void;
  unregister: (id: string) => void;
  emitFrom: (id: string, args: { position: Position; maxScroll: Limits }) => void;
}

const ScrollSyncContext = createContext<ScrollSyncAPI | null>(null);

export const ScrollSyncProvider: React.FC<{ children: React.ReactNode }>= ({ children }) => {
  const listenersRef = useRef<Map<string, Listener>>(new Map());

  const api = useMemo<ScrollSyncAPI>(() => ({
    register: (id, listener) => {
      listenersRef.current.set(id, listener);
    },
    unregister: (id) => {
      listenersRef.current.delete(id);
    },
    emitFrom: (id, args) => {
      // Notify everyone except the source id
      listenersRef.current.forEach((listener, key) => {
        if (key !== id) listener(args);
      });
    }
  }), []);

  return (
    <ScrollSyncContext.Provider value={api}>{children}</ScrollSyncContext.Provider>
  );
};

export const useScrollSync = (): ScrollSyncAPI => {
  const ctx = useContext(ScrollSyncContext);
  if (!ctx) throw new Error('useScrollSync must be used within ScrollSyncProvider');
  return ctx;
};


