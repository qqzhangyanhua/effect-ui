"use client";

// Ported from ns-ui (MIT, (c) 2026 Nikolas Sapalidis) — https://github.com/nikolas-sapa/ns-ui/blob/main/registry/core/checkbox-domino-run/component.tsx

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
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
// ToppleRun — a select-all whose propagation is the interaction model, not a
// cosmetic stagger. Flipping the master checkbox releases a wavefront that
// travels down the list at a fixed rate (14 rows/sec): as the front reaches
// row i, that row's own checkbox commits its new state under a 120ms
// spring-eased transition and the row takes a transient translateY(2px)
// lean toward row i+1 — read as the wave shoving the next domino — handed
// off with a short overlap so consecutive leans read as continuous contact.
// A thin tick travels the list's left edge marking the front's live
// position. Every row commits its state the instant the front passes it, so
// there is nothing to roll back: stopping the run just stops future rows
// from being touched.
//
// INTERRUPTION: the run is spatially interruptible, not just cancelable —
// activating ANY row (pointer or keyboard, since every row stays a fully
// operable checkbox for the run's entire duration) halts the wave
// immediately. Rows the front already passed keep their committed state;
// rows beyond the front are simply untouched, standing exactly as they
// were. Escape halts it too. This is the "all except a few" recovery path:
// watch the run, stop it where you want, no undo needed because nothing
// past that point was ever touched.
//
// A11Y: the master is a real input[type=checkbox] with aria-controls
// pointing at the row list's id; a polite live region announces once at
// the start ("Enabling all…") and once at the end or halt ("Enabled 34 of
// 40, stopped at row 35."). Every row is a real checkbox with its own
// native label association — nothing here is conveyed only by animation.
//
// REDUCED MOTION: there is no wave to catch, so interruption is replaced by
// a straightforward safety net — the master flips every row in a single
// frame and a 5s Undo affordance appears, reverting the whole batch if
// pressed in time.
//
// TOKENS: --foreground for ink (checkbox fill, the traveling tick),
// --border for hairlines, --ns-muted for secondary text, --ns-accent for the
// focus ring only. Pure DOM/CSS, no canvas.
// ---------------------------------------------------------------------------

const ROWS_PER_SEC = 14;
const ROW_H = 56; // px — must match the row wrapper's fixed height
const UNDO_MS = 5000;

export interface ToppleRunItem {
  /** Stable identifier for this row. */
  id: string;
  /** Primary row label — also becomes its checkbox's accessible name. */
  label: string;
  /** Optional secondary line (sender, timestamp, byline...). */
  description?: string;
}

export interface ToppleRunProps {
  /** Rows the master toggle governs, top to bottom = wave direction. */
  items: ToppleRunItem[];
  /** Label for the master control. @default "Select all" */
  label?: string;
  /** Ids checked on mount. @default [] */
  defaultChecked?: string[];
  /** Rows the wave crosses per second. @default 14 */
  speed?: number;
  /** Fires whenever the checked set changes, including mid-run commits. */
  onChange?: (checkedIds: string[]) => void;
  /** extra classes merged onto the rendered root element */
  className?: string;
}

function useReducedMotion() {
  return usePrefersReducedMotion();
}

interface Row extends ToppleRunItem {
  checked: boolean;
}

export function ToppleRun({
  items,
  label = "Select all",
  defaultChecked = [],
  speed = ROWS_PER_SEC,
  onChange,
  className = "",
}: ToppleRunProps) {
  const rowsPerSec = Math.max(1, speed);
  const leanMs = Math.round(1000 / rowsPerSec) + 40;
  const nsRootRef = useRef<HTMLDivElement | null>(null);
  const nsMotion = useNsBind(nsRootRef as RefObject<HTMLElement | null>);
  const nsRequestFrame = nsMotion.requestFrame;
  const nsCancelFrame = nsMotion.cancelFrame;
  const nsMotionNow = nsMotion.motionNow;

  const uid = useId();
  const reducedMotion = useReducedMotion();

  const [rows, setRows] = useState<Row[]>(() =>
    items.map((item) => ({
      ...item,
      checked: defaultChecked.includes(item.id),
    }))
  );
  const [running, setRunning] = useState(false);
  const [liveMsg, setLiveMsg] = useState("");
  const [undoAvailable, setUndoAvailable] = useState(false);

  const masterRef = useRef<HTMLInputElement | null>(null);
  const rowElRefs = useRef<(HTMLLIElement | null)[]>([]);
  const tickRef = useRef<HTMLDivElement | null>(null);

  const rafRef = useRef<number | undefined>(undefined);
  const runTokenRef = useRef(0);
  const committedRef = useRef(-1);
  const startTimeRef = useRef(0);
  const targetRef = useRef(true);
  const leanTimersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(
    new Map()
  );
  const undoSnapshotRef = useRef<Row[] | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );

  const total = rows.length;
  const checkedCount = rows.reduce((n, r) => (r.checked ? n + 1 : n), 0);
  const allChecked = total > 0 && checkedCount === total;
  const noneChecked = checkedCount === 0;
  const indeterminate = !allChecked && !noneChecked;

  useEffect(() => {
    if (masterRef.current) masterRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    onChange?.(rows.filter((r) => r.checked).map((r) => r.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  const clearLeanTimers = useCallback(() => {
    leanTimersRef.current.forEach((t) => clearTimeout(t));
    leanTimersRef.current.clear();
  }, []);

  const commitRow = useCallback((index: number, checked: boolean) => {
    setRows((prev) => {
      if (prev[index]?.checked === checked) return prev;
      const next = prev.slice();
      next[index] = { ...next[index]!, checked };
      return next;
    });
    const el = rowElRefs.current[index];
    if (el) {
      el.style.transform = "translateY(2px)";
      const prevTimer = leanTimersRef.current.get(index);
      if (prevTimer) clearTimeout(prevTimer);
      leanTimersRef.current.set(
        index,
        setTimeout(() => {
          el.style.transform = "";
          leanTimersRef.current.delete(index);
        }, leanMs)
      );
    }
  }, [leanMs]);

  const endRun = useCallback(
    (committedCount: number, rowTotal: number) => {
      if (rafRef.current !== undefined) {
        nsCancelFrame(rafRef.current);
        rafRef.current = undefined;
      }
      setRunning(false);
      if (tickRef.current) tickRef.current.style.opacity = "0";
      const verb = targetRef.current ? "Enabled" : "Disabled";
      if (rowTotal === 0) {
        setLiveMsg("");
      } else if (committedCount >= rowTotal) {
        setLiveMsg(`${verb} all ${rowTotal}.`);
      } else {
        setLiveMsg(
          `${verb} ${committedCount} of ${rowTotal}, stopped at row ${
            committedCount + 1
          }.`
        );
      }
    },
    []
  );

  const haltRun = useCallback(() => {
    if (!running) return;
    runTokenRef.current += 1;
    endRun(committedRef.current + 1, total);
  }, [running, endRun, total]);

  const startRun = useCallback(
    (target: boolean) => {
      if (total === 0) return;
      if (rafRef.current !== undefined) nsCancelFrame(rafRef.current);
      clearLeanTimers();

      runTokenRef.current += 1;
      const token = runTokenRef.current;
      targetRef.current = target;
      committedRef.current = -1;
      startTimeRef.current = nsMotionNow();
      setRunning(true);
      setLiveMsg(target ? "Enabling all…" : "Disabling all…");
      if (tickRef.current) {
        tickRef.current.style.opacity = "1";
        tickRef.current.style.transform = "translateY(0px)";
      }

      const step = (now: number) => {
        if (runTokenRef.current !== token) return;
        const elapsedS = (now - startTimeRef.current) / 1000;
        const front = elapsedS * rowsPerSec;
        if (tickRef.current) {
          tickRef.current.style.transform = `translateY(${
            Math.min(front, total) * ROW_H
          }px)`;
        }
        while (committedRef.current + 1 < total && committedRef.current + 1 <= front) {
          const i = committedRef.current + 1;
          commitRow(i, target);
          committedRef.current = i;
        }
        if (committedRef.current >= total - 1) {
          endRun(total, total);
          return;
        }
        rafRef.current = nsRequestFrame(step);
      };
      rafRef.current = nsRequestFrame(step);
    },
    [total, clearLeanTimers, commitRow, endRun, rowsPerSec]
  );

  // Escape halts a live run from anywhere.
  useEffect(() => {
    if (!running) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") haltRun();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, haltRun]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== undefined) nsCancelFrame(rafRef.current);
      clearLeanTimers();
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, [clearLeanTimers]);

  const handleMasterChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const target = e.target.checked;
      if (total === 0) return;

      if (reducedMotion) {
        if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
        undoSnapshotRef.current = rows.map((r) => ({ ...r }));
        setRows((prev) => prev.map((r) => ({ ...r, checked: target })));
        setLiveMsg(
          target ? `Enabled all ${total}.` : `Disabled all ${total}.`
        );
        setUndoAvailable(true);
        undoTimerRef.current = setTimeout(() => {
          setUndoAvailable(false);
          undoSnapshotRef.current = null;
        }, UNDO_MS);
        return;
      }

      startRun(target);
    },
    [total, reducedMotion, rows, startRun]
  );

  const handleRowChange = useCallback(
    (index: number, checked: boolean) => {
      if (running) haltRun();
      setRows((prev) => {
        const next = prev.slice();
        next[index] = { ...next[index]!, checked };
        return next;
      });
    },
    [running, haltRun]
  );

  const handleUndo = useCallback(() => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    if (undoSnapshotRef.current) {
      const snapshot = undoSnapshotRef.current;
      setRows(snapshot);
      setLiveMsg("Undone.");
    }
    setUndoAvailable(false);
    undoSnapshotRef.current = null;
  }, []);

  const groupId = `checkbox-domino-run-${uid}-group`;
  const liveId = `checkbox-domino-run-${uid}-live`;

  return (
    <div ref={nsRootRef} data-slot="checkbox-domino-run" data-reduced={nsMotion.reduced ? "true" : "false"} data-motion={nsMotion.motionOn ? "on" : "off"} className={`w-full rounded-md border border-border bg-card ${className}`}>
      <NsPause slot="checkbox-domino-run" />
      <div id={liveId} aria-live="polite" className="sr-only">
        {liveMsg}
      </div>

      <label className="relative flex h-14 cursor-pointer select-none items-center gap-3 border-b border-border px-4">
        <input
          ref={masterRef}
          type="checkbox"
          className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 focus:outline-none"
          checked={allChecked}
          onChange={handleMasterChange}
          aria-controls={groupId}
        />
        <CheckboxVisual
          checked={allChecked}
          indeterminate={indeterminate}
          reducedMotion={reducedMotion}
        />
        <span className="flex-1 text-[13px] font-medium text-foreground">
          {label}
        </span>
        <span aria-hidden="true" className="font-mono text-[11px] text-muted-foreground">
          {checkedCount}/{total}
        </span>
      </label>

      <div className="relative">
        <div
          ref={tickRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 z-10 h-14 w-[2px] bg-foreground opacity-0 will-change-transform"
        />
        <ul id={groupId}>
          {rows.map((row, i) => (
            <li
              key={row.id}
              ref={(el) => {
                rowElRefs.current[i] = el;
              }}
              style={{
                transition: reducedMotion
                  ? undefined
                  : `transform ${leanMs}ms cubic-bezier(0.34, 1.56, 0.64, 1)`,
              }}
              className={i < rows.length - 1 ? "h-14 border-b border-border" : "h-14"}
            >
              <label className="relative flex h-full cursor-pointer select-none items-center gap-3 px-4">
                <input
                  type="checkbox"
                  className="peer absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 focus:outline-none"
                  checked={row.checked}
                  onChange={(e) => handleRowChange(i, e.target.checked)}
                />
                <CheckboxVisual
                  checked={row.checked}
                  reducedMotion={reducedMotion}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] text-foreground">
                    {row.label}
                  </span>
                  {row.description && (
                    <span className="block truncate text-[12px] text-muted-foreground">
                      {row.description}
                    </span>
                  )}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {undoAvailable && (
        <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
          <span className="text-[12px] text-muted-foreground">
            Batch applied — undo within {UNDO_MS / 1000}s.
          </span>
          <button
            type="button"
            onClick={handleUndo}
            className="rounded-sm border border-border px-2.5 py-1 text-[12px] font-medium text-foreground transition-colors duration-150 hover:border-foreground/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Undo
          </button>
        </div>
      )}
    </div>
  );
}

function CheckboxVisual({
  checked,
  indeterminate = false,
  reducedMotion = false,
}: {
  checked: boolean;
  indeterminate?: boolean;
  reducedMotion?: boolean;
}) {
  const springDuration = reducedMotion ? "0ms" : "120ms";
  const springEase = "cubic-bezier(0.34, 1.56, 0.64, 1)";
  return (
    <span
      aria-hidden="true"
      className="relative inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border border-border bg-background peer-checked:border-foreground peer-checked:bg-foreground peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring"
      style={{
        transition: `background-color ${springDuration} ${springEase}, border-color ${springDuration} ${springEase}`,
      }}
    >
      <svg
        viewBox="0 0 16 16"
        className="h-3 w-3 text-background"
        style={{
          opacity: checked && !indeterminate ? 1 : 0,
          transform: checked && !indeterminate ? "scale(1)" : "scale(0.5)",
          transition: `opacity ${springDuration} ${springEase}, transform ${springDuration} ${springEase}`,
        }}
      >
        <path
          d="M3 8.2L6.2 11.4L13 4.4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span
        className="absolute h-[2px] w-2.5 rounded-full bg-background"
        style={{
          opacity: indeterminate ? 1 : 0,
          transition: `opacity ${springDuration} ${springEase}`,
        }}
      />
    </span>
  );
}
