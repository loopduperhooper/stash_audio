import { useEffect, useState } from "react";
import type { FunscriptAction } from "src/utils/funscriptScheduler";
export type { FunscriptAction } from "src/utils/funscriptScheduler";

export function useFunscript(url: string | undefined): FunscriptAction[] | null {
  const [loaded, setLoaded] = useState<{ url: string; actions: FunscriptAction[] } | null>(null);

  useEffect(() => {
    setLoaded(null);
    if (!url) return;
    const controller = new AbortController();
    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Unable to load funscript");
        return res.json();
      })
      .then((data: { actions?: FunscriptAction[] } | null) => {
        if (controller.signal.aborted || !Array.isArray(data?.actions)) return;
        const points = data.actions.filter((a) => a && Number.isFinite(a.at) && a.at >= 0 && Number.isFinite(a.pos) && a.pos >= 0 && a.pos <= 100);
        points.sort((a, b) => a.at - b.at);
        // A timestamp can have only one target; the last point wins.
        const unique = points.filter((a, i) => points[i + 1]?.at !== a.at);
        setLoaded({ url, actions: unique });
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoaded(null);
      });
    return () => controller.abort();
  }, [url]);

  // Never expose the previous track's points during a new source's render.
  return loaded?.url === url ? loaded?.actions ?? null : null;
}
