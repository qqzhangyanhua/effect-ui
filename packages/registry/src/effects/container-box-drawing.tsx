"use client";

// Ported from ns-ui (MIT, (c) 2026 Nikolas Sapalidis) — https://github.com/nikolas-sapa/ns-ui/blob/main/registry/core/container-box-drawing/component.tsx

import {
  useEffect,
  useLayoutEffect,
  useMemo,
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

type Role = "corner-tl" | "corner-tr" | "corner-bl" | "corner-br" | "h" | "v";
type Cell = { char: string } | { refIndex: number; role: Role };

const SINGLE: Record<Role, string> = {
  "corner-tl": "┌",
  "corner-tr": "┐",
  "corner-bl": "└",
  "corner-br": "┘",
  h: "─",
  v: "│",
};
const DOUBLE: Record<Role, string> = {
  "corner-tl": "╔",
  "corner-tr": "╗",
  "corner-bl": "╚",
  "corner-br": "╝",
  h: "═",
  v: "║",
};

export interface RuleFrameProps {
  /** sits inline in the top rule, like a fieldset legend */
  title?: string;
  /** the framed content */
  children?: React.ReactNode;
  /** extra classes merged onto the rendered root element */
  className?: string;
}

// Builds every border position once, as plain data, in true clockwise order
// starting at the top-left corner: each rule-character position gets a
// stable `refIndex` (0..N-1) assigned by pure traversal order, never by a
// ref-callback side effect. That matters because React tears down and sets
// up a ref callback on every render whose identity changed (ours always
// does, since it closes over per-render data) — if the index came from an
// incrementing counter read inside the callback itself, an old callback's
// teardown firing after a new callback's setup would scramble the count.
// Indexing from precomputed data sidesteps that: every callback, old or
// new, only ever writes to the one slot it was built for.
function buildPerimeter(cols: number, rows: number, title?: string) {
  const role: Role[] = [];
  let n = 0;
  const alloc = (r: Role) => {
    role[n] = r;
    return n++;
  };

  // `cols`/`rows` are the FULL measured box in character units, corners
  // included. Each straight edge holds two of those cells for its own
  // corners, so the run of dash/bar glyphs between them is cols-2 / rows-2
  // long, not cols / rows — using the full count here was the bug: it made
  // every straight edge two characters longer than the box it was supposed
  // to tile, so the perimeter never closed.
  const innerCols = Math.max(0, cols - 2);
  const innerRows = Math.max(0, rows - 2);

  const titleText = title ? ` ${title} ` : "";
  const titleCols = Math.min(titleText.length, innerCols);
  const leftDashes = Math.max(0, Math.floor((innerCols - titleCols) / 2));

  const tl: Cell = { refIndex: alloc("corner-tl"), role: "corner-tl" };
  const top: Cell[] = [];
  for (let i = 0; i < innerCols; i++) {
    if (title && i >= leftDashes && i < leftDashes + titleCols) {
      top.push({ char: titleText[i - leftDashes] ?? "" });
    } else {
      top.push({ refIndex: alloc("h"), role: "h" });
    }
  }
  const tr: Cell = { refIndex: alloc("corner-tr"), role: "corner-tr" };

  const right: Cell[] = Array.from({ length: innerRows }, () => ({
    refIndex: alloc("v"),
    role: "v" as Role,
  }));

  const br: Cell = { refIndex: alloc("corner-br"), role: "corner-br" };
  // clockwise continues right-to-left along the bottom
  const bottomRTL: Cell[] = Array.from({ length: innerCols }, () => ({
    refIndex: alloc("h"),
    role: "h" as Role,
  }));
  const bl: Cell = { refIndex: alloc("corner-bl"), role: "corner-bl" };

  // then bottom-to-top along the left edge
  const leftBTT: Cell[] = Array.from({ length: innerRows }, () => ({
    refIndex: alloc("v"),
    role: "v" as Role,
  }));

  return { role, tl, top, tr, right, br, bottomRTL, bl, leftBTT, total: n };
}

export function RuleFrame({ title, children, className = "" }: RuleFrameProps) {
  const nsRootRef = useRef<HTMLDivElement | null>(null);
  const nsMotion = useNsBind(nsRootRef as RefObject<HTMLElement | null>);
  const nsRequestFrame = nsMotion.requestFrame;
  const nsCancelFrame = nsMotion.cancelFrame;
  const nsMotionNow = nsMotion.motionNow;

  const contentRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);
  const [grid, setGrid] = useState({ cols: 20, rows: 4 });
  const [hovered, setHovered] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const active = hovered || focusWithin;

  // measure the content box + a 1ch/1lh probe, recompute the character
  // counts the border needs to tile exactly across whatever size the
  // children end up being
  useLayoutEffect(() => {
    const content = contentRef.current;
    const probe = probeRef.current;
    if (!content || !probe) return;

    const measure = () => {
      const cell = probe.getBoundingClientRect();
      const box = content.getBoundingClientRect();
      if (cell.width <= 0 || cell.height <= 0) return;
      setGrid({
        cols: Math.max(4, Math.round(box.width / cell.width)),
        rows: Math.max(2, Math.round(box.height / cell.height)),
      });
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(content);
    document.fonts.ready.then(measure).catch(() => {});
    return () => ro.disconnect();
  }, [title]);

  const perimeter = useMemo(
    () => buildPerimeter(grid.cols, grid.rows, title),
    [grid.cols, grid.rows, title]
  );

  const elsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const roleRef = useRef<Role[]>([]);
  useLayoutEffect(() => {
    roleRef.current = perimeter.role;
  });

  const cellRef = (cell: Cell) => {
    if ("char" in cell) return undefined;
    const { refIndex } = cell;
    return (el: HTMLSpanElement | null) => {
      elsRef.current[refIndex] = el;
    };
  };

  const renderCell = (cell: Cell, key: number) =>
    "char" in cell ? (
      <span key={key} aria-hidden className="text-foreground">
        {cell.char}
      </span>
    ) : (
      <span key={key} aria-hidden ref={cellRef(cell)} />
    );

  // paint every position's resting glyph before the sweep effect below gets
  // a chance to animate it, so a grid change mid-hover never flashes blank
  useLayoutEffect(() => {
    roleRef.current.forEach((role, i) => {
      const el = elsRef.current[i];
      if (el) el.textContent = active ? DOUBLE[role] : SINGLE[role];
    });
  });

  // the actual sweep: character-by-character, starting at the top-left
  // corner (refIndex 0) and proceeding clockwise in refIndex order
  useEffect(() => {
    const n = perimeter.total;
    if (n === 0) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const paint = (count: number) => {
      for (let i = 0; i < n; i++) {
        const el = elsRef.current[i];
        if (!el) continue;
        const role = roleRef.current[i];
        if (!role) continue;
        const flipped = active ? i < count : i >= count;
        el.textContent = flipped ? DOUBLE[role] : SINGLE[role];
      }
    };

    if (reduced) {
      // paint(n) settles BOTH directions: active flips `i < n` (all double),
      // inactive flips `i >= n` (all single). `paint(0)` for inactive would
      // flip every index and render a full double border at rest.
      paint(n);
      return;
    }

    const duration = Math.min(900, Math.max(300, n * 16));
    const start = nsMotionNow();
    let raf = 0;
    const tick = (now: number) => {
      const frac = Math.min(1, (now - start) / duration);
      paint(Math.floor(frac * n));
      if (frac < 1) raf = nsRequestFrame(tick);
    };
    raf = nsRequestFrame(tick);
    return () => nsCancelFrame(raf);
  }, [active, perimeter]);

  return (
    <div
      ref={nsRootRef}
      data-slot="container-box-drawing"
      data-reduced={nsMotion.reduced ? "true" : "false"}
      data-motion={nsMotion.motionOn ? "on" : "off"}
      data-container-box-drawing
      className={`relative inline-block font-mono leading-[1.4] ${className}`}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={() => setFocusWithin(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocusWithin(false);
      }}
    >
      <NsPause slot="container-box-drawing" />
      {/* 1ch/1lh probe — invisible, used only to measure the font's own
          character cell so the border can tile in whole characters */}
      <span
        ref={probeRef}
        aria-hidden
        className="pointer-events-none invisible absolute h-[1lh] w-[1ch] leading-[1.4]"
      />

      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 select-none transition-colors duration-300 ${
          active ? "text-foreground" : "text-border"
        }`}
      >
        <div className="absolute inset-x-0 top-0 flex whitespace-pre">
          {renderCell(perimeter.tl, -1)}
          {perimeter.top.map(renderCell)}
          {renderCell(perimeter.tr, -2)}
        </div>
        <div
          className="absolute bottom-[1lh] right-0 top-[1lh] flex flex-col"
        >
          {perimeter.right.map(renderCell)}
        </div>
        {/* rendered right-to-left in the DOM (matching the clockwise refIndex
            order) and restored to visual left-to-right with row-reverse */}
        <div className="absolute inset-x-0 bottom-0 flex flex-row-reverse whitespace-pre">
          {renderCell(perimeter.br, -3)}
          {perimeter.bottomRTL.map(renderCell)}
          {renderCell(perimeter.bl, -4)}
        </div>
        {/* rendered bottom-to-top in the DOM, restored to visual top-to-bottom
            with column-reverse */}
        <div
          className="absolute bottom-[1lh] left-0 top-[1lh] flex flex-col-reverse"
        >
          {perimeter.leftBTT.map(renderCell)}
        </div>
      </div>

      <div ref={contentRef} className="relative px-[1ch] py-[1lh]">
        {children}
      </div>
    </div>
  );
}
