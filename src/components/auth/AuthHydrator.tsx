"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store";

export function AuthHydrator() {
  const hydrateSession = useAppStore((state) => state.hydrateSession);

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  return null;
}
