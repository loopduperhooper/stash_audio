import { useEffect, useState } from "react";

export interface FunscriptAction {
  at: number; // ms from start
  pos: number; // 0-100
}

export function useFunscript(url: string | undefined): FunscriptAction[] | null {
  const [actions, setActions] = useState<FunscriptAction[] | null>(null);

  useEffect(() => {
    if (!url) {
      setActions(null);
      return;
    }

    let cancelled = false;

    fetch(url)
      .then((res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data: { actions?: FunscriptAction[] } | null) => {
        if (cancelled || !data?.actions) return;
        const sorted = [...data.actions].sort((a, b) => a.at - b.at);
        setActions(sorted);
      })
      .catch(() => {
        if (!cancelled) setActions(null);
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return actions;
}
