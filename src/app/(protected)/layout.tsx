"use client";

import { PageMetaProvider } from "@/components/layout/PageMetaContext";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <PageMetaProvider>{children}</PageMetaProvider>;
}
