export function formatWhen(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Chicago",
  }).format(d) + " CT";
}

export function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}
