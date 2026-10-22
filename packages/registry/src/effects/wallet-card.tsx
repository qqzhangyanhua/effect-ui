"use client"

// Ported from beUI (MIT, (c) 2026 Saurabh Chauhan) — https://github.com/starc007/ui-components/blob/main/components/motion/wallet-card/index.tsx

import { useAnimationActive } from "@/hooks/use-animation-active"
import { useDismiss } from "@/hooks/use-dismiss"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { ActionSwapIcon, ActionSwapText } from "@/components/ui/action-swap"
import { cn } from "@/lib/utils"
import { ArrowDownToLine, ArrowUp, Bell, Check, ChevronDown, Copy, CreditCard, Eye, EyeOff, History, Repeat, Search, TrendingDown, TrendingUp } from "lucide-react"
import { AnimatePresence, motion, type Transition, type Variants } from "motion/react"
import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ComponentType, type ReactNode } from "react"

const Quiet = createContext(false)

function useQuietMotion() {
  const reduced = usePrefersReducedMotion()
  const quiet = useContext(Quiet)
  return reduced || quiet
}

const EASE_OUT = [0.16, 1, 0.3, 1] as const
const SPRING_PRESS = { type: "spring" as const, stiffness: 500, damping: 30, mass: 0.6 }

function Button({
  children,
  onClick,
  className,
  "aria-label": ariaLabel,
}: {
  children?: ReactNode
  onClick?: () => void
  className?: string
  "aria-label"?: string
  variant?: string
  size?: string
}) {
  return (
    <button type="button" onClick={onClick} aria-label={ariaLabel} className={cn("inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring", className)}>
      {children}
    </button>
  )
}


export type WalletAccount = {
  id: string;
  name: string;
  address: string;
  avatar?: ReactNode;
};

export interface WalletCardProps {
  accounts: WalletAccount[];
  accountId?: string;
  defaultAccountId?: string;
  onAccountChange?: (id: string) => void;
  balance: number;
  balancePrefix?: string;
  /** Initial balance change shown in the pill before any live change. */
  defaultChange?: number;
  /** Start with the balance hidden behind dots. */
  defaultBalanceHidden?: boolean;
  onSend?: () => void;
  onDeposit?: () => void;
  onSwap?: () => void;
  onBuy?: () => void;
  searchPlaceholder?: string;
  /** Recent searches shown in the expanded search panel. */
  searchRecent?: string[];
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: (value: string) => void;
  /** Show an unread pulse on the notifications bell. */
  hasNotifications?: boolean;
  onNotifications?: () => void;
  className?: string;
}

export function diceBearGlassUrl(seed: string) {
  return `https://api.dicebear.com/9.x/glass/svg?seed=${encodeURIComponent(seed)}`;
}

export function truncateAddress(address: string) {
  return address.length > 12
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : address;
}


// Trigger box grows into the full-width panel and back — one shared surface.
export const MORPH: Transition = { type: "spring", duration: 0.5, bounce: 0.22 };

export const LIST: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.035, delayChildren: 0.12 } },
};

export const ITEM: Variants = {
  hidden: { opacity: 0, y: -6, filter: "blur(3px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
};

// Shared padding for the account trigger + panel header so the avatar/name stay
// put as the box morphs — the panel reads as the trigger itself growing open.
export const HEAD = "flex items-center gap-2 px-2 py-1.5 text-left";


export function AccountAvatar({
  account,
  className,
}: {
  account: WalletAccount;
  className?: string;
}) {
  if (account.avatar) return <>{account.avatar}</>;
  return (
    // biome-ignore lint/performance/noImgElement: remote DiceBear SVG, no next/image benefit
    <img
      src={diceBearGlassUrl(account.id || account.address)}
      alt={account.name}
      className={cn("h-7 w-7 shrink-0 rounded-full bg-muted", className)}
    />
  );
}



/**
 * Copies `value` to the clipboard and swaps the copy icon for a check via the
 * library's ActionSwapIcon. Stops click propagation so it can sit inside a
 * selectable row.
 */
export function CopyButton({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // clipboard may be unavailable (insecure context) — swap anyway
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <button
      type="button"
      aria-label={copied ? "Copied" : "Copy address"}
      onClick={(e) => {
        e.stopPropagation();
        copy();
      }}
      className={cn(
        "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      <ActionSwapIcon
        value={copied ? "check" : "copy"}
        variant="cascade"
        className="h-3.5 w-3.5"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-emerald-500" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </ActionSwapIcon>
    </button>
  );
}



/**
 * A transient change indicator for the balance: a tinted pill with a trend
 * arrow that pops in whenever the balance moves and persists until it moves
 * again.
 */
export function BalanceDelta({
  balance,
  initialChange,
}: {
  balance: number;
  initialChange?: number;
}) {
  const reduce = useQuietMotion();
  const prevRef = useRef(balance);
  const [delta, setDelta] = useState<{ id: number; amount: number } | null>(
    initialChange ? { id: 0, amount: initialChange } : null,
  );

  // Persist the last change until the balance moves again — don't auto-hide.
  useEffect(() => {
    const diff = balance - prevRef.current;
    prevRef.current = balance;
    if (diff === 0) return;
    setDelta({ id: Date.now(), amount: diff });
  }, [balance]);

  const up = (delta?.amount ?? 0) > 0;

  return (
    <div className="mt-2 flex h-7 items-center justify-center">
      <AnimatePresence mode="wait">
        {delta ? (
          <motion.span
            key={delta.id}
            initial={{ opacity: 0, y: reduce ? 0 : 6, scale: reduce ? 1 : 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: reduce ? 0 : -6, scale: reduce ? 1 : 0.9 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums",
              up
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "bg-red-500/15 text-red-600 dark:text-red-400",
            )}
          >
            {up ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            {up ? "+" : "-"}$
            {Math.abs(delta.amount).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </div>
  );
}



type WalletAction = {
  key: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  onClick?: () => void;
};

/**
 * Row of primary wallet actions rendered icon-over-label, with a spring press.
 */
export function WalletActions({
  onSend,
  onDeposit,
  onSwap,
  onBuy,
}: {
  onSend?: () => void;
  onDeposit?: () => void;
  onSwap?: () => void;
  onBuy?: () => void;
}) {
  const reduce = useQuietMotion();

  const actions: WalletAction[] = [
    { key: "send", label: "Send", icon: ArrowUp, onClick: onSend },
    { key: "deposit", label: "Deposit", icon: ArrowDownToLine, onClick: onDeposit },
    { key: "swap", label: "Swap", icon: Repeat, onClick: onSwap },
    { key: "buy", label: "Buy", icon: CreditCard, onClick: onBuy },
  ];

  return (
    <div className="flex items-start justify-between gap-2">
      {actions.map(({ key, label, icon: Icon, onClick }) => (
        <motion.button
          key={key}
          type="button"
          onClick={onClick}
          whileTap={reduce ? undefined : { scale: 0.94 }}
          transition={SPRING_PRESS}
          className="flex flex-1 flex-col items-center gap-2 outline-none"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-foreground">
            <Icon className="h-5 w-5" />
          </span>
          <span className="text-xs font-medium text-muted-foreground">
            {label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}



/**
 * Account switcher whose trigger morphs into a panel that grows rightward to
 * full width (covering the header icons) and downward at the same time, via a
 * shared layoutId. Self-contained — not the generic MorphSelect.
 */
export function AccountSwitcher({
  accounts,
  activeAccount,
  onSelect,
}: {
  accounts: WalletAccount[];
  activeAccount: WalletAccount | undefined;
  onSelect: (id: string) => void;
}) {
  const reduce = useQuietMotion() ?? false;
  const layoutId = `${useId()}-account`;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  // Hover only arms after the morph settles — otherwise the panel expands under
  // the cursor and flashes a phantom hover bg on whatever item it lands on.
  const [armed, setArmed] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useDismiss(open, close, rootRef);

  if (!open && armed) setArmed(false);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => setArmed(true), reduce ? 0 : 280);
    return () => window.clearTimeout(t);
  }, [open, reduce]);

  const morph = reduce ? { duration: 0 } : MORPH;

  return (
    // static (not relative) so the absolute trigger + panel anchor to the
    // header row and can span its full width, covering the icons.
    <div ref={rootRef} className="min-w-0">
      {/* in-flow sizer: reserves the widest possible trigger footprint (every
          account name stacked in one grid cell) so the header row width never
          changes — neither when the trigger leaves the flow nor when a shorter
          account name is selected. */}
      <div aria-hidden className={cn(HEAD, "pointer-events-none opacity-0")}>
        <AccountAvatar account={activeAccount ?? accounts[0] ?? { id: "empty", name: "Account", address: "" }} />
        <span className="grid">
          {accounts.map((account) => (
            <span
              key={account.id}
              className="col-start-1 row-start-1 whitespace-nowrap text-sm font-medium"
            >
              {account.name}
            </span>
          ))}
        </span>
        <ChevronDown className="h-4 w-4" />
      </div>

      <AnimatePresence initial={false} mode="popLayout">
        {open ? null : (
          <motion.button
            key="trigger"
            layoutId={layoutId}
            type="button"
            aria-haspopup="listbox"
            aria-expanded={false}
            onClick={() => setOpen(true)}
            transition={morph}
            style={{ borderRadius: 16 }}
            className={cn(
              HEAD,
              // shifted left by the padding so the avatar sits flush with the
              // card content edge (aligned with the balance + buttons below).
              "absolute top-0 -left-2 z-20 max-w-full outline-none transition-colors hover:bg-muted/60",
            )}
          >
            {activeAccount ? (
              <>
                <AccountAvatar account={activeAccount} />
                <motion.span
                  layout="position"
                  className="truncate text-sm font-medium text-foreground"
                >
                  {activeAccount.name}
                </motion.span>
                <motion.span layout="position" className="text-muted-foreground">
                  <ChevronDown className="h-4 w-4" />
                </motion.span>
              </>
            ) : null}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false} mode="popLayout">
        {open ? (
          <motion.div
            key="panel"
            layoutId={layoutId}
            role="listbox"
            transition={morph}
            style={{ borderRadius: 16 }}
            className="absolute top-0 -right-2 -left-2 z-30 overflow-hidden border border-border/30 bg-background backdrop-blur-md"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className={cn(HEAD, "w-full outline-none")}
            >
              {activeAccount ? <AccountAvatar account={activeAccount} /> : null}
              <motion.span
                layout="position"
                className="min-w-0 flex-1 truncate text-sm font-medium text-foreground"
              >
                {activeAccount?.name ?? "Select account"}
              </motion.span>
              <motion.span
                layout="position"
                animate={{ rotate: 180 }}
                transition={morph}
                className="text-muted-foreground"
              >
                <ChevronDown className="h-4 w-4" />
              </motion.span>
            </button>

            <motion.ul
              initial="hidden"
              animate="show"
              variants={reduce ? undefined : LIST}
              className={cn(
                "max-h-64 overflow-y-auto p-1.5",
                armed ? "" : "pointer-events-none",
              )}
            >
              {accounts.map((account) => {
                const selected = account.id === activeAccount?.id;
                return (
                  <motion.li
                    key={account.id}
                    variants={reduce ? undefined : ITEM}
                    className={cn(
                      "flex items-center rounded-xl pr-1 text-sm transition-colors",
                      selected
                        ? "bg-muted text-foreground"
                        : cn(
                            "text-muted-foreground",
                            armed && "hover:bg-muted hover:text-foreground",
                          ),
                    )}
                  >
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => {
                        onSelect(account.id);
                        setOpen(false);
                      }}
                      className="flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-2 py-2 text-left outline-none"
                    >
                      <AccountAvatar account={account} />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate font-medium">
                          {account.name}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {truncateAddress(account.address)}
                        </span>
                      </span>
                      {selected ? (
                        <Check className="h-4 w-4 shrink-0 text-foreground" />
                      ) : null}
                    </button>
                    <CopyButton value={account.address} />
                  </motion.li>
                );
              })}
            </motion.ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}



/**
 * Search icon that morphs into a full-width search bar via a shared layoutId,
 * growing leftward across the header row. The recent-searches results render as
 * a SEPARATE dropdown below the bar — not part of the morphing element — so
 * filtering as you type resizes only the dropdown and never re-fires the morph
 * (which would scale-distort the input text). The in-flow slot keeps its width
 * whether open or closed so the header row (and card) never shifts.
 */
export function SearchBar({
  placeholder = "Search",
  recent = [],
  onChange,
  onSubmit,
}: {
  placeholder?: string;
  recent?: string[];
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
}) {
  const reduce = useQuietMotion() ?? false;
  const layoutId = `${useId()}-search`;
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  // Hover arms after the dropdown reveals so it doesn't flash a phantom hover.
  const [armed, setArmed] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  useDismiss(open, close, rootRef);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (!open && armed) setArmed(false);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => setArmed(true), reduce ? 0 : 260);
    return () => window.clearTimeout(t);
  }, [open, reduce]);

  // The box keeps the bouncy morph (same feel as the account switcher)...
  const morph: Transition = reduce ? { duration: 0 } : MORPH;
  // ...but the leading icon + input travel across the row, so their own layout
  // uses a critically-damped spring — they glide to place without inheriting the
  // box's overshoot (which read as the icon jittering right-then-left).
  const glide: Transition = reduce
    ? { duration: 0 }
    : { type: "spring", duration: 0.5, bounce: 0 };

  const query = value.trim().toLowerCase();
  const filtered = query
    ? recent.filter((r) => r.toLowerCase().includes(query))
    : recent;

  const submit = (next: string) => {
    onSubmit?.(next);
    setOpen(false);
  };

  return (
    // static so the open bar + dropdown anchor to the header row (spanning its
    // width), while the slot below reserves the icon's footprint.
    <div ref={rootRef} className="shrink-0">
      {/* reserve the icon's width while open (the icon has left the flow) */}
      {open ? <div aria-hidden className="h-8 w-8" /> : null}

      <AnimatePresence initial={false} mode="popLayout">
        {open ? null : (
          <motion.button
            key="icon"
            layoutId={layoutId}
            type="button"
            aria-label="Search"
            onClick={() => setOpen(true)}
            transition={morph}
            style={{ borderRadius: 12 }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground"
          >
            <Search className="h-4 w-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* one connected panel: input + results grow out of the trigger. The text
          nodes use layout="position" so when the panel resizes (filtering) they
          reposition without scaling — no re-morph distortion, still connected. */}
      <AnimatePresence initial={false} mode="popLayout">
        {open ? (
          <motion.div
            key="panel"
            layoutId={layoutId}
            transition={morph}
            style={{ borderRadius: 16 }}
            className="absolute top-0 -right-2 -left-2 z-40 overflow-hidden border border-border/30 bg-background backdrop-blur-md"
          >
            <div className="flex h-9 items-center gap-2 px-3">
              <motion.span
                layout="position"
                transition={glide}
                className="shrink-0"
              >
                <Search className="h-4 w-4 text-muted-foreground" />
              </motion.span>
              <motion.input
                ref={inputRef}
                layout="position"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  opacity: { duration: 0.15, delay: 0.12, ease: EASE_OUT },
                  layout: glide,
                }}
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  onChange?.(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && value.trim()) submit(value.trim());
                  if (e.key === "Escape") close();
                }}
                placeholder={placeholder}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>

            <div className="h-px bg-border/40" />

            {filtered.length > 0 ? (
              <motion.ul
                initial="hidden"
                animate="show"
                variants={reduce ? undefined : LIST}
                className={cn(
                  "max-h-56 overflow-y-auto p-1.5",
                  armed ? "" : "pointer-events-none",
                )}
              >
                {filtered.map((term) => (
                  <motion.li
                    key={term}
                    layout="position"
                    variants={reduce ? undefined : ITEM}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setValue(term);
                        onChange?.(term);
                        submit(term);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm text-muted-foreground outline-none transition-colors",
                        armed && "hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <History className="h-4 w-4 shrink-0" />
                      <span className="min-w-0 flex-1 truncate">{term}</span>
                    </button>
                  </motion.li>
                ))}
              </motion.ul>
            ) : (
              <motion.div
                layout="position"
                className="flex flex-col items-center gap-1 px-4 py-8 text-center"
              >
                <Search className="h-5 w-5 text-muted-foreground/60" />
                <p className="text-sm text-muted-foreground">
                  {query ? "No matches" : "No recent searches"}
                </p>
              </motion.div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}



/**
 * Composed wallet overview card: an account switcher whose trigger morphs open
 * into a full-width panel, a search icon that morphs into a search bar, a
 * rolling balance with a transient change indicator, and Send / Deposit
 * actions. Actions and search are plain callbacks — the resulting flow is left
 * to the consumer.
 */
export function WalletCard({
  accounts,
  accountId,
  defaultAccountId,
  onAccountChange,
  balance,
  balancePrefix = "$",
  defaultChange,
  defaultBalanceHidden = false,
  onSend,
  onDeposit,
  onSwap,
  onBuy,
  searchPlaceholder,
  searchRecent,
  onSearchChange,
  onSearchSubmit,
  hasNotifications = false,
  onNotifications,
  className,
}: WalletCardProps) {
  const accountControlled = accountId !== undefined;
  const [internalAccountId, setInternalAccountId] = useState(
    defaultAccountId ?? accounts[0]?.id,
  );
  const [balanceHidden, setBalanceHidden] = useState(defaultBalanceHidden);

  const shownBalance = `${balancePrefix}${balance.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
  const maskedBalance = "*".repeat(7);
  const activeAccountId = accountControlled ? accountId : internalAccountId;
  const activeAccount =
    accounts.find((a) => a.id === activeAccountId) ?? accounts[0];

  const handleAccountChange = (id: string) => {
    if (!accountControlled) setInternalAccountId(id);
    onAccountChange?.(id);
  };

  const rootRef = useRef<HTMLDivElement>(null)
  const prefersReduced = usePrefersReducedMotion()
  const live = useAnimationActive(rootRef)
  return (
    <Quiet.Provider value={prefersReduced || !live}>
    <div
      ref={rootRef}
      data-reduced={prefersReduced ? "" : undefined}
      data-motion={live ? "on" : "off"}
      className={cn(
        "relative w-full max-w-xs overflow-hidden rounded-4xl border border-border p-6 motion-reduce:transition-none",
        className,
      )}
    >
      {/* relative anchor so the switcher + search panels span the whole row */}
      <div className="relative flex items-center justify-between gap-2">
        <AccountSwitcher
          accounts={accounts}
          activeAccount={activeAccount}
          onSelect={handleAccountChange}
        />

        <div className="flex shrink-0 items-center gap-1">
          <SearchBar
            placeholder={searchPlaceholder}
            recent={searchRecent}
            onChange={onSearchChange}
            onSubmit={onSearchSubmit}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={onNotifications}
            aria-label="Notifications"
            className="relative"
          >
            <Bell className="h-4 w-4" />
            {hasNotifications ? (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
            ) : null}
          </Button>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center text-center">
        <div className="flex items-center gap-1.5">
          <p className="text-xs text-muted-foreground">Balance</p>
          <button
            type="button"
            onClick={() => setBalanceHidden((h) => !h)}
            aria-label={balanceHidden ? "Show balance" : "Hide balance"}
            aria-pressed={balanceHidden}
            className="text-muted-foreground outline-none transition-colors hover:text-foreground"
          >
            {balanceHidden ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
        {/* One ActionSwapText swaps the number and the asterisk mask with a
            per-letter cascade — same baseline, no overlap or layout shift. */}
        <ActionSwapText
          value={balanceHidden ? "hidden" : shownBalance}
          variant="cascade"
          className="text-3xl font-semibold text-foreground"
        >
          {balanceHidden ? maskedBalance : shownBalance}
        </ActionSwapText>
        {balanceHidden ? (
          <div className="mt-2 flex h-7 items-center justify-center">
            <span className="translate-y-[3px] text-sm font-semibold text-muted-foreground leading-none tracking-[0.3em]">
              *****
            </span>
          </div>
        ) : (
          <BalanceDelta balance={balance} initialChange={defaultChange} />
        )}
      </div>

      <div className="mt-8">
        <WalletActions
          onSend={onSend}
          onDeposit={onDeposit}
          onSwap={onSwap}
          onBuy={onBuy}
        />
      </div>
    </div>
    </Quiet.Provider>
  );
}
