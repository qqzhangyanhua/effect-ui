"use client";

// Ported from ns-ui (MIT, (c) 2026 Nikolas Sapalidis) — https://github.com/nikolas-sapa/ns-ui/blob/main/registry/core/feed-escapement/component.tsx

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
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
// EscapementTick — a live feed admitted one item at a time by a physical
// gate, not a scheduler. Arrivals mount immediately as collapsed, aria-hidden
// list rows (height 0, translateY -8px) — the queue is real DOM, just
// invisible. A small SVG anchor fork in the gutter rocks +-12deg each time it
// lets exactly one row through; that row's height/translateY are driven by a
// single rAF spring (refs only, no React state on the hot path), and the
// anchor will not rock again until THAT spring's displacement and velocity
// both fall under epsilon. Because it's real block-level height growing in
// normal flow, everything already released underneath shifts down together
// as one connected chain — there is no per-row stagger to schedule. A burst
// of arrivals becomes calm tick-tick-tick admission instead of a dogpile.
// aria-live=polite (role=log) + per-row aria-atomic gives screen reader
// users the same serialized cadence for free. "Release all" (button or
// Escape) flushes the queue instantly, for when metered admission isn't
// what's wanted.
// ---------------------------------------------------------------------------

export interface EscapementEntryInput {
  title: string;
  detail?: string;
  /** display timestamp; defaults to the current time */
  timestamp?: string;
}

export interface EscapementTickHandle {
  /** enqueue one item behind the escapement; returns its id */
  arrive: (entry: EscapementEntryInput) => string;
  /** instantly reveal every pending item, skipping the metered cadence */
  releaseAll: () => void;
  /** remove every item and reset the queue */
  clear: () => void;
}

type EntryRec = {
  id: string;
  title: string;
  detail?: string;
  timestamp: string;
};

type SpringNode = {
  el: HTMLLIElement;
  natural: number;
  t: number;
  v: number;
  raf: number;
  last: number;
};

// spring constants — underdamped just enough for one small settle wobble,
// not a bounce; tuned against REST_OFFSET/ANCHOR_ANGLE below
const SPRING_K = 210;
const SPRING_C = 25;
const EPS_POS = 0.003;
const EPS_VEL = 0.02;
const REST_OFFSET = -8; // px, matches the brief's hidden-state translateY
const ANCHOR_ANGLE = 12; // deg, the fork's rock amplitude

let idSeed = 0;
function nextId() {
  idSeed += 1;
  return `esc-${idSeed}-${Date.now().toString(36)}`;
}

function nowLabel() {
  return new Date().toLocaleTimeString([], {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function AnchorFork({ innerRef }: { innerRef: (el: SVGSVGElement | null) => void }) {
  return (
    <svg
      ref={innerRef}
      aria-hidden
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0 text-muted-foreground"
      style={{ transformOrigin: "12px 12px" }}
    >
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      <path d="M4.5 12h15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path
        d="M4.5 12c0 1.8 1 3 2.6 3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M19.5 12c0 1.8-1 3-2.6 3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const EscapementTick = forwardRef<
  EscapementTickHandle,
  {
    /** extra classes merged onto the rendered root element */
    className?: string;
    /** accessible name for the feed. Default "Live activity feed". */
    "aria-label"?: string;
    /** shown while no items have arrived yet */
    emptyLabel?: string;
  }
>(function EscapementTick(
  {
    className = "",
    "aria-label": ariaLabel = "Live activity feed",
    emptyLabel = "Waiting for activity…",
  },
  ref
) {
  const nsRootRef = useRef<HTMLDivElement | null>(null);
  const nsMotion = useNsBind(nsRootRef as RefObject<HTMLElement | null>);
  const nsRequestFrame = nsMotion.requestFrame;
  const nsCancelFrame = nsMotion.cancelFrame;
  const nsMotionNow = nsMotion.motionNow;

  const [entries, setEntries] = useState<EntryRec[]>([]);

  const itemElRef = useRef<Map<string, HTMLLIElement>>(new Map());
  const pendingRef = useRef<string[]>([]); // ids awaiting release, FIFO
  const activeIdRef = useRef<string | null>(null);
  const springRef = useRef<SpringNode | null>(null);
  const tickDirRef = useRef(1);
  const anchorElRef = useRef<SVGSVGElement | null>(null);
  const anchorTimeoutRef = useRef<number | null>(null);
  const reducedRef = useRef(false);
  const counterElRef = useRef<HTMLSpanElement>(null);
  const depthRef = useRef(0);
  // stable indirection: releaseNext recurses into "itself" via this ref so
  // its own useCallback identity never needs to depend on itself
  const releaseNextRef = useRef<() => void>(() => {});

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedRef.current = mq.matches;
    const onChange = (e: MediaQueryListEvent) => {
      reducedRef.current = e.matches;
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    return () => {
      if (springRef.current) nsCancelFrame(springRef.current.raf);
      if (anchorTimeoutRef.current !== null) window.clearTimeout(anchorTimeoutRef.current);
    };
  }, []);

  const setCounter = useCallback((n: number) => {
    depthRef.current = n;
    const el = counterElRef.current;
    if (el) el.textContent = String(n);
  }, []);

  const rockAnchor = useCallback(() => {
    const el = anchorElRef.current;
    if (!el || reducedRef.current) return;
    if (anchorTimeoutRef.current !== null) window.clearTimeout(anchorTimeoutRef.current);
    tickDirRef.current *= -1;
    const angle = tickDirRef.current * ANCHOR_ANGLE;
    el.style.transition = "transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)";
    el.style.transform = `rotate(${angle}deg)`;
    anchorTimeoutRef.current = window.setTimeout(() => {
      el.style.transition = "transform 260ms cubic-bezier(0.22, 1, 0.36, 1)";
      el.style.transform = "rotate(0deg)";
      anchorTimeoutRef.current = null;
    }, 200);
  }, []);

  const settleImmediately = useCallback((el: HTMLLIElement) => {
    el.style.transition = "none";
    el.style.height = "auto";
    el.style.transform = "translateY(0px)";
    el.removeAttribute("aria-hidden");
  }, []);

  // the escapement gate: exactly one spring runs at a time. It only pulls
  // the next queued id once displacement AND velocity are both under
  // epsilon, so cadence follows real settle time, never a fixed offset.
  const releaseNext = useCallback(() => {
    if (activeIdRef.current !== null) return; // still settling — gate closed
    const next = pendingRef.current.shift();
    if (!next) return;
    const el = itemElRef.current.get(next);
    if (!el) {
      releaseNextRef.current();
      return;
    }
    activeIdRef.current = next;
    el.removeAttribute("aria-hidden");
    rockAnchor();
    const natural = el.scrollHeight;
    const node: SpringNode = { el, natural, t: 0, v: 0, raf: 0, last: 0 };
    springRef.current = node;

    const step = (now: number) => {
      const dt = node.last === 0 ? 1 / 60 : Math.min(0.05, (now - node.last) / 1000);
      node.last = now;
      const force = SPRING_K * (1 - node.t) - SPRING_C * node.v;
      node.v += force * dt;
      node.t += node.v * dt;
      node.el.style.height = `${Math.max(0, node.t) * node.natural}px`;
      node.el.style.transform = `translateY(${((1 - node.t) * REST_OFFSET).toFixed(2)}px)`;

      if (Math.abs(1 - node.t) < EPS_POS && Math.abs(node.v) < EPS_VEL) {
        node.el.style.height = "auto";
        node.el.style.transform = "translateY(0px)";
        springRef.current = null;
        activeIdRef.current = null;
        setCounter(Math.max(0, depthRef.current - 1));
        releaseNextRef.current();
        return;
      }
      node.raf = nsRequestFrame(step);
    };
    node.raf = nsRequestFrame(step);
  }, [rockAnchor, setCounter]);

  // Ref callbacks run before effects, so the gate installed for this commit has to be current now.
  // eslint-disable-next-line react-hooks/refs
  releaseNextRef.current = releaseNext;

  const attachItem = useCallback(
    (id: string, el: HTMLLIElement | null) => {
      if (!el) return;
      if (itemElRef.current.get(id) === el) return; // same node, already wired
      itemElRef.current.set(id, el);

      if (reducedRef.current) {
        // reduced motion: nothing actually queues, so the depth this item
        // contributed in arrive() must come right back off — otherwise the
        // "queued" counter climbs forever while every item lands instantly.
        settleImmediately(el);
        setCounter(Math.max(0, depthRef.current - 1));
        return;
      }
      el.style.overflow = "hidden";
      el.style.height = "0px";
      el.style.transform = `translateY(${REST_OFFSET}px)`;
      el.setAttribute("aria-hidden", "true");
      pendingRef.current.push(id);
      releaseNextRef.current();
    },
    [settleImmediately, setCounter]
  );

  const arrive = useCallback(
    (entry: EscapementEntryInput) => {
      const id = nextId();
      setEntries((prev) => [
        { id, title: entry.title, detail: entry.detail, timestamp: entry.timestamp ?? nowLabel() },
        ...prev,
      ]);
      setCounter(depthRef.current + 1);
      return id;
    },
    [setCounter]
  );

  const releaseAll = useCallback(() => {
    const node = springRef.current;
    if (node) {
      nsCancelFrame(node.raf);
      settleImmediately(node.el);
      springRef.current = null;
    }
    activeIdRef.current = null;
    const remaining = pendingRef.current;
    pendingRef.current = [];
    for (const id of remaining) {
      const el = itemElRef.current.get(id);
      if (el) settleImmediately(el);
    }
    setCounter(0);
  }, [settleImmediately, setCounter]);

  const clear = useCallback(() => {
    if (springRef.current) nsCancelFrame(springRef.current.raf);
    springRef.current = null;
    activeIdRef.current = null;
    pendingRef.current = [];
    itemElRef.current.clear();
    setEntries([]);
    setCounter(0);
  }, [setCounter]);

  useImperativeHandle(ref, () => ({ arrive, releaseAll, clear }), [arrive, releaseAll, clear]);

  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        e.preventDefault();
        releaseAll();
      }
    },
    [releaseAll]
  );

  return (
    <div
      ref={nsRootRef}
      onKeyDown={onKeyDown}
      data-slot="feed-escapement"
      data-reduced={nsMotion.reduced ? "true" : "false"}
      data-motion={nsMotion.motionOn ? "on" : "off"}
      className={`flex w-full flex-col rounded-md border border-border bg-card ${className}`}
    >
      <NsPause slot="feed-escapement" />
      <div className="flex items-center gap-2.5 border-b border-border px-3.5 py-2.5">
        <AnchorFork innerRef={(el) => (anchorElRef.current = el)} />
        <span className="font-mono text-[11px] tracking-wide text-muted-foreground">
          <span ref={counterElRef}>0</span> queued
        </span>
        <button
          type="button"
          onClick={releaseAll}
          className="ml-auto cursor-pointer rounded-sm border border-border px-2.5 py-1 font-mono text-[10px] tracking-widest text-muted-foreground transition-colors duration-150 hover:border-foreground/20 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          RELEASE ALL
        </button>
      </div>
      <ul
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label={ariaLabel}
        className="flex flex-col overflow-hidden"
      >
        {entries.length === 0 ? (
          <li className="px-3.5 py-6 text-center font-mono text-[11px] text-muted-foreground">
            {emptyLabel}
          </li>
        ) : (
          entries.map((entry) => (
            <li
              key={entry.id}
              ref={(el) => attachItem(entry.id, el)}
              aria-atomic="true"
              className="border-b border-border/60 px-3.5 py-2.5 last:border-b-0 will-change-[height,transform]"
            >
              <div className="flex items-baseline justify-between gap-3">
                <p className="truncate text-[13px] text-foreground">{entry.title}</p>
                <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground">
                  {entry.timestamp}
                </span>
              </div>
              {entry.detail ? (
                <p className="mt-0.5 truncate font-mono text-[11px] text-muted-foreground">{entry.detail}</p>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </div>
  );
});
