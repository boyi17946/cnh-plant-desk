"use client";

import { useCallback, useEffect, useState } from "react";

export function usePlantApi<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => {
    setLoading(true);
    setError(null);
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    if (!url) return;
    const ac = new AbortController();
    fetch(url, { cache: "no-store", signal: ac.signal })
      .then(async (res) => {
        const body = (await res.json()) as T & { error?: string };
        if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
        setData(body);
        setError(null);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (ac.signal.aborted) return;
        setData(null);
        setError(err instanceof Error ? err.message : "Network error");
        setLoading(false);
      });
    return () => ac.abort();
  }, [url, tick]);

  return { data, error, loading, reload, setData };
}
