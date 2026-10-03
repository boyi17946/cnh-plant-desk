"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function usePlantApi<T>(url: string | null, initial?: T | null) {
  const [data, setData] = useState<T | null>(initial ?? null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!initial);
  const [tick, setTick] = useState(0);
  const skipFirst = useRef(Boolean(initial));

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!url) return;
    if (skipFirst.current) {
      skipFirst.current = false;
      return;
    }

    let cancelled = false;
    fetch(url, { cache: "no-store" })
      .then(async (res) => {
        const body = (await res.json()) as T & { error?: string };
        if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
        if (cancelled) return;
        setData(body);
        setError(null);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setData(null);
        setError(err instanceof Error ? err.message : "Network error");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [url, tick]);

  return { data, error, loading, reload, setData };
}
