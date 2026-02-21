"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type PageMeta = {
  title: string;
  subtitle?: string;
  breadcrumb?: string[];
};

const PageMetaContext = createContext<{
  meta: PageMeta;
  setMeta: (meta: PageMeta) => void;
} | null>(null);

export function PageMetaProvider({ children }: { children: ReactNode }) {
  const [meta, setMeta] = useState<PageMeta>({
    title: "Panel",
    subtitle: "",
    breadcrumb: [],
  });

  const value = useMemo(() => ({ meta, setMeta }), [meta]);

  return <PageMetaContext.Provider value={value}>{children}</PageMetaContext.Provider>;
}

export function usePageMeta() {
  const ctx = useContext(PageMetaContext);
  if (!ctx) {
    throw new Error("usePageMeta debe usarse dentro de PageMetaProvider");
  }
  return ctx;
}

export function PageHeader({
  title,
  subtitle,
  breadcrumb,
}: {
  title: string;
  subtitle?: string;
  breadcrumb?: string[];
}) {
  const { setMeta } = usePageMeta();

  useEffect(() => {
    setMeta({ title, subtitle, breadcrumb });
  }, [title, subtitle, breadcrumb, setMeta]);

  return null;
}
