"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LoadingState({ label }: { label: string }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {[0, 1, 2, 3].map((i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="h-4 w-1/3 rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="h-3 w-full rounded bg-muted" />
            <div className="mt-2 h-3 w-2/3 rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
      <p className="text-sm text-muted-foreground md:col-span-2">{label}</p>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="text-destructive">Desk API is down</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          This is not an empty plant. The board could not load from the local
          store. ({message})
        </p>
        {onRetry ? (
          <Button variant="outline" onClick={onRetry}>
            Retry
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function EmptyState({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  );
}

export function SeverityBadge({ severity }: { severity: string }) {
  if (severity === "stop") {
    return <Badge variant="destructive">Stop the station</Badge>;
  }
  if (severity === "slow") {
    return <Badge variant="secondary">Run slow</Badge>;
  }
  return <Badge variant="outline">Watch</Badge>;
}

export function StatusBadge({ status }: { status: string }) {
  const label = status.replace("-", " ");
  if (status === "down" || status === "stop" || status === "parts-hold") {
    return <Badge variant="destructive">{label}</Badge>;
  }
  if (status === "hold" || status === "queued" || status === "open") {
    return <Badge variant="secondary">{label}</Badge>;
  }
  if (status === "wrenching" || status === "diagnosed" || status === "assigned") {
    return <Badge>{label}</Badge>;
  }
  return <Badge variant="outline">{label}</Badge>;
}
