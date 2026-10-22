"use client";

// Ported from ns-ui (MIT, (c) 2026 Nikolas Sapalidis) — https://github.com/nikolas-sapa/ns-ui/blob/main/registry/core/undo-ghost-row/component.tsx

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { useAnimationActive } from "@/hooks/use-animation-active";
import type { RefObject } from "react";

type NsJob = { token: number; cb: (now: number) => void; raf: number };
type NsApi = {
  requestFrame: (cb: (now: number) => void) => number;
  cancelFrame: (id: number | null | undefined) => void;
  motionNow: () => number;
};

const nsApi: NsApi = {
  requestFrame: (cb) => requestAnimationFrame((t) => cb(t)),
  cancelFrame: (id) => {
    if (id) cancelAnimationFrame(id);
  },
  motionNow: () => performance.now(),
};

function nsRequestFrame(cb: (now: number) => void) {
  return nsApi.requestFrame(cb);
}
function nsCancelFrame(id: number | null | undefined) {
  nsApi.cancelFrame(id);
}
function nsMotionNow() {
  return nsApi.motionNow();
}

function useNsBind(rootRef: RefObject<HTMLElement | null>) {
  const reduced = usePrefersReducedMotion();
  const live = useAnimationActive(rootRef as RefObject<Element | null>);
  const liveRef = useRef(live);
  const reducedRef = useRef(reduced);
  const holdRef = useRef(0);
  const offsetRef = useRef(0);
  const jobsRef = useRef(new Map<number, NsJob>());
  const seqRef = useRef(1);

  const motionNow = () => {
    const raw = performance.now();
    if (!liveRef.current) {
      if (holdRef.current === 0) holdRef.current = raw;
      return holdRef.current - offsetRef.current;
    }
    if (holdRef.current !== 0) {
      offsetRef.current += raw - holdRef.current;
      holdRef.current = 0;
    }
    return raw - offsetRef.current;
  };

  const requestFrame = (cb: (now: number) => void) => {
    const token = seqRef.current++;
    const job: NsJob = { token, cb, raf: 0 };
    jobsRef.current.set(token, job);
    const kick = () => {
      if (!liveRef.current) {
        if (holdRef.current === 0) holdRef.current = performance.now();
        job.raf = 0;
        return;
      }
      job.raf = requestAnimationFrame(() => {
        if (!jobsRef.current.has(token)) return;
        if (!liveRef.current) {
          job.raf = 0;
          if (holdRef.current === 0) holdRef.current = performance.now();
          return;
        }
        jobsRef.current.delete(token);
        cb(motionNow());
      });
    };
    kick();
    return token;
  };

  const cancelFrame = (id: number | null | undefined) => {
    if (id == null) return;
    const job = jobsRef.current.get(id);
    if (!job) return;
    if (job.raf) cancelAnimationFrame(job.raf);
    jobsRef.current.delete(id);
  };

  useEffect(() => {
    liveRef.current = live;
    reducedRef.current = reduced;
  }, [live, reduced]);

  useEffect(() => {
    nsApi.requestFrame = requestFrame;
    nsApi.cancelFrame = cancelFrame;
    nsApi.motionNow = motionNow;
  });

  useEffect(() => {
    if (!live) return;
    for (const job of [...jobsRef.current.values()]) {
      if (job.raf) continue;
      const { token, cb } = job;
      job.raf = requestAnimationFrame(() => {
        if (!jobsRef.current.has(token)) return;
        if (!liveRef.current) {
          job.raf = 0;
          return;
        }
        jobsRef.current.delete(token);
        cb(motionNow());
      });
    }
  }, [live]);

  useEffect(
    () => () => {
      for (const job of jobsRef.current.values()) {
        if (job.raf) cancelAnimationFrame(job.raf);
      }
      jobsRef.current.clear();
    },
    [],
  );

  return { reduced, live, motionOn: live && !reduced, requestFrame, cancelFrame, motionNow };
}

function NsPause({ slot }: { slot: string }) {
  return (
    <style>{`[data-slot="${slot}"][data-motion="off"],[data-slot="${slot}"][data-motion="off"] *{animation-play-state:paused !important}`}</style>
  );
}

// ---------------------------------------------------------------------------
// AfterImageList — inline undo for destructive list actions, no toast. On
// delete, a row swaps in place for a same-height ghost: 1px dashed --border,
// the item title at 40% opacity, a real "Undo delete: <title>" button. The
// ghost's height is driven directly by the Web Animations API (linear,
// ~8s, full height -> 0) so remaining time reads as remaining height —
// siblings below ride the shrink smoothly since it's plain document flow.
// Hover or focus pauses the Animation object in place; a click cancels it,
// reads the live height, and starts a second animation back up to full
// height with an ease-out-expo curve, restoring the row on finish. Deletion
// announces the undo window through an aria-live region; the timer is
// genuinely paused while the ghost has keyboard focus, so assistive tech is
// never raced by the clock. prefers-reduced-motion holds the ghost at full
// height indefinitely (no auto-collapse) and adds an explicit dismiss
// button, since there is no longer a timeout to rely on.
// ---------------------------------------------------------------------------

export interface AfterImageItem {
  id: string;
  title: string;
  subtitle?: string;
}

export interface AfterImageListProps {
  /** the deletable rows */
  items: AfterImageItem[];
  /** ms the ghost takes to collapse to zero height and finalize the delete */
  ghostMs?: number;
  /** called immediately when a row's delete is triggered, before the ghost window */
  onDelete?: (item: AfterImageItem) => void;
  /** called if the delete is undone within the ghost window */
  onRestore?: (item: AfterImageItem) => void;
  /** fires once the ghost window elapses (or is dismissed) and the item is gone for good */
  onExpire?: (item: AfterImageItem) => void;
  /** extra classes merged onto the rendered root element */
  className?: string;
}

// Re-inflate curve: an ease-out-expo approximation, matching the house
// spring-adjacent easing used elsewhere in this registry (see approval-inline-diff's
// collapse transition) rather than inventing a new one.
const REINFLATE_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
const REINFLATE_MS = 380;

function useReducedMotion() {
  return usePrefersReducedMotion();
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden>
      <path
        d="M3 4.5h10M6.5 4.5V3a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1.5M4.5 4.5l.6 8.2a1 1 0 0 0 1 .8h3.8a1 1 0 0 0 1-.8l.6-8.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UndoIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0" fill="none" aria-hidden>
      <path
        d="M4 6.5H10.5a3 3 0 0 1 0 6H8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.2 4 4 6.5l2.2 2.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden>
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function Row({ item, onDelete }: { item: AfterImageItem; onDelete: () => void }) {
  return (
    <li className="border-b border-border last:border-b-0">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-foreground">{item.title}</p>
          {item.subtitle ? (
            <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
          ) : null}
        </div>
        <button
          type="button"
          data-afterimage-delete
          onClick={onDelete}
          aria-label={`Delete ${item.title}`}
          className="shrink-0 rounded-sm p-1.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <TrashIcon />
        </button>
      </div>
    </li>
  );
}

function GhostRow({
  item,
  ghostMs,
  reduced,
  active,
  onRestore,
  onExpire,
}: {
  item: AfterImageItem;
  ghostMs: number;
  reduced: boolean;
  active: boolean;
  onRestore: () => void;
  onExpire: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<Animation | null>(null);
  const fullRef = useRef(0);
  const hoverRef = useRef(false);
  const focusRef = useRef(false);
  const settledRef = useRef(false); // true once restored or expired — guards double-fire

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const full = el.scrollHeight;
    fullRef.current = full;
    el.style.height = `${full}px`;

    if (reduced) return; // static: no clock to race, dismiss button finalizes instead

    const anim = el.animate(
      [{ height: `${full}px` }, { height: "0px" }],
      { duration: ghostMs, easing: "linear", fill: "forwards" }
    );
    animRef.current = anim;
    anim.onfinish = () => {
      if (settledRef.current) return;
      settledRef.current = true;
      onExpire();
    };
    return () => {
      anim.cancel();
    };
    // ghostMs/onExpire intentionally fixed for this ghost's lifetime — a
    // prop change mid-collapse shouldn't restart the clock out from under it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  useEffect(() => {
    const anim = animRef.current;
    if (!anim || reduced) return;
    if (!active || hoverRef.current || focusRef.current) anim.pause();
    else if (anim.playState === "paused") anim.play();
  }, [active, reduced]);

  function pause() {
    animRef.current?.pause();
  }

  function maybeResume() {
    if (hoverRef.current || focusRef.current) return;
    const anim = animRef.current;
    if (anim && anim.playState === "paused") anim.play();
  }

  function handleRestore() {
    if (settledRef.current) return;
    settledRef.current = true;
    const el = wrapRef.current;
    const anim = animRef.current;
    if (!el || reduced || !anim) {
      onRestore();
      return;
    }
    const currentHeight = el.getBoundingClientRect().height;
    anim.cancel();
    const reinflate = el.animate(
      [{ height: `${currentHeight}px` }, { height: `${fullRef.current}px` }],
      { duration: REINFLATE_MS, easing: REINFLATE_EASE, fill: "forwards" }
    );
    animRef.current = reinflate;
    reinflate.onfinish = () => onRestore();
  }

  return (
    <li className="border-b border-border last:border-b-0">
      <div ref={wrapRef} className="overflow-hidden">
        <div
          className="flex items-center gap-2 border border-dashed border-border px-4 py-3"
          onPointerEnter={() => {
            hoverRef.current = true;
            pause();
          }}
          onPointerLeave={() => {
            hoverRef.current = false;
            maybeResume();
          }}
          onFocus={() => {
            focusRef.current = true;
            pause();
          }}
          onBlur={() => {
            focusRef.current = false;
            maybeResume();
          }}
        >
          <button
            type="button"
            data-afterimage-undo
            onClick={handleRestore}
            aria-label={`Undo delete: ${item.title}`}
            className="flex min-w-0 flex-1 items-center gap-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <UndoIcon />
            <span className="truncate text-sm text-foreground/40">{item.title}</span>
          </button>
          {reduced ? (
            <button
              type="button"
              onClick={() => {
                if (settledRef.current) return;
                settledRef.current = true;
                onExpire();
              }}
              aria-label={`Dismiss: finish deleting ${item.title}`}
              className="shrink-0 rounded-sm p-1.5 text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <XIcon />
            </button>
          ) : (
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
              Undo
            </span>
          )}
        </div>
      </div>
    </li>
  );
}

export function AfterImageList({
  items,
  ghostMs = 8000,
  onDelete,
  onRestore,
  onExpire,
  className = "",
}: AfterImageListProps) {
  const nsRootRef = useRef<HTMLDivElement | null>(null);
  const nsMotion = useNsBind(nsRootRef as RefObject<HTMLElement | null>);
  const nsRequestFrame = nsMotion.requestFrame;
  const nsCancelFrame = nsMotion.cancelFrame;
  const nsMotionNow = nsMotion.motionNow;

  const [rows, setRows] = useState(() => items.map((it) => ({ ...it, ghosted: false })));
  const [announcement, setAnnouncement] = useState("");
  const reduced = useReducedMotion();
  const rowsRef = useRef(rows);
  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  function handleDelete(id: string) {
    const item = rowsRef.current.find((r) => r.id === id);
    if (!item) return;
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ghosted: true } : r)));
    onDelete?.(item);
    setAnnouncement(
      reduced
        ? `Deleted ${item.title}. Undo available until dismissed.`
        : `Deleted ${item.title}. Undo available for ${Math.round(ghostMs / 1000)} seconds.`
    );
  }

  function handleRestore(id: string) {
    const item = rowsRef.current.find((r) => r.id === id);
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ghosted: false } : r)));
    if (item) {
      onRestore?.(item);
      setAnnouncement(`Restored ${item.title}.`);
    }
  }

  function handleExpire(id: string) {
    const item = rowsRef.current.find((r) => r.id === id);
    setRows((rs) => rs.filter((r) => r.id !== id));
    if (item) onExpire?.(item);
  }

  return (
    <div ref={nsRootRef} data-slot="undo-ghost-row" data-reduced={nsMotion.reduced ? "true" : "false"} data-motion={nsMotion.motionOn ? "on" : "off"} className={className}>
      <NsPause slot="undo-ghost-row" />
      {rows.length === 0 ? (
        <p className="rounded-md border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          Nothing here.
        </p>
      ) : (
        <ul className="overflow-hidden rounded-md border border-border bg-card">
          {rows.map((r) =>
            r.ghosted ? (
              <GhostRow
                key={r.id}
                item={r}
                ghostMs={ghostMs}
                reduced={reduced}
                active={nsMotion.live}
                onRestore={() => handleRestore(r.id)}
                onExpire={() => handleExpire(r.id)}
              />
            ) : (
              <Row key={r.id} item={r} onDelete={() => handleDelete(r.id)} />
            )
          )}
        </ul>
      )}
      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
