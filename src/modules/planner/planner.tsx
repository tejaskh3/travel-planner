"use client";

import { useEffect, useRef, useState } from "react";
import { BRAND_GRADIENT, BRAND_GRADIENT_SOFT, cn } from "@/lib/cn.util";
import { fmtInrK } from "@/lib/currency.util";
import {
  CheckIcon,
  ChevIcon,
  LogoIcon,
  PinIcon,
  RefreshIcon,
  RouteIcon,
  SearchIcon,
  SparklesIcon,
  StarsIcon,
  WalletIcon,
  WandIcon,
} from "@/icons/icons";
import {
  BUDGET_RANGE_INR,
  BUDGET_TICKS_INR,
  CityKey,
  CITY_VISUALS,
  DAY_OPTIONS,
  GROUPS,
  Pace,
  PACES,
  STYLES,
  type TGroupKey,
  type TStyleKey,
} from "./planner.constants";

const BrandHeader = () => (
  <div className="mb-7 flex items-center gap-3">
    <div
      className="grid h-10 w-10 place-items-center rounded-md text-white"
      style={{ backgroundImage: BRAND_GRADIENT, boxShadow: "var(--shadow-grad)" }}
    >
      <LogoIcon />
    </div>
    <div>
      <div className="font-display text-[17px] font-bold tracking-tight text-ink">
        TravelSync AI
      </div>
      <div className="mt-px text-xs text-ink-soft">
        Personalized itineraries optimized for time and budget.
      </div>
    </div>
  </div>
);

type SectionProps = { num: number; title: string; children: React.ReactNode };
const Section = ({ num, title, children }: SectionProps) => (
  <div className="mb-[22px]">
    <div className="mb-2.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.06em] text-ink-soft">
      <span className="grid h-[18px] w-[18px] place-items-center rounded-md border border-border bg-surface-2 text-[10px] text-ink-2">
        {num}
      </span>
      {title}
    </div>
    {children}
  </div>
);

type DestinationPickerProps = { value: CityKey; onChange: (v: CityKey) => void };
const DestinationPicker = ({ value, onChange }: DestinationPickerProps) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const current = CITY_VISUALS[value];
  const filtered = (Object.entries(CITY_VISUALS) as [CityKey, typeof current][]).filter(
    ([, v]) => v.displayName.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center gap-3 rounded-md border bg-surface-2 px-3.5 py-3 text-left transition-all",
          open
            ? "border-indigo ring-4 ring-indigo/10"
            : "border-border hover:border-border-strong",
        )}
      >
        <div
          className="grid h-9 w-9 shrink-0 place-items-center rounded-[9px] text-white"
          style={{
            backgroundImage: `linear-gradient(135deg, ${current.gradient[0]}, ${current.gradient[1]})`,
          }}
        >
          <PinIcon size={18} />
        </div>
        <div className="flex-1">
          <div className="text-[15px] font-semibold tracking-tight text-ink">
            {current.displayName}
          </div>
          <div className="mt-px text-xs text-ink-soft">{current.vibe}</div>
        </div>
        <ChevIcon
          className={cn("text-ink-faint transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="animate-fade-slide absolute left-0 right-0 top-[calc(100%+6px)] z-20 overflow-hidden rounded-md border border-border bg-white shadow-lg">
          <div className="relative">
            <SearchIcon
              size={14}
              className="pointer-events-none absolute left-3 top-[13px] text-ink-faint"
            />
            <input
              autoFocus
              placeholder="Search destinations…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full border-b border-border-soft py-2.5 pl-9 pr-3 text-[13px] outline-none"
            />
          </div>
          {filtered.map(([key, v]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                onChange(key);
                setOpen(false);
                setQ("");
              }}
              className={cn(
                "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-surface-2",
                key === value && "bg-surface-2",
              )}
            >
              <div
                className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-[7px] text-white"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${v.gradient[0]}, ${v.gradient[1]})`,
                }}
              >
                <PinIcon size={14} />
              </div>
              <div className="flex-1">
                <div className="text-[13.5px] font-semibold text-ink">{v.displayName}</div>
                <div className="text-[11px] text-ink-soft">{v.vibe}</div>
              </div>
              {key === value && <CheckIcon size={14} className="text-indigo" />}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="px-3.5 py-3.5 text-[12.5px] text-ink-faint">No matches.</div>
          )}
        </div>
      )}
    </div>
  );
};

type DaysSelectorProps = { value: number; onChange: (v: number) => void };
const DaysSelector = ({ value, onChange }: DaysSelectorProps) => (
  <div className="grid grid-cols-3 gap-2">
    {DAY_OPTIONS.map((n) => {
      const active = value === n;
      return (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={cn(
            "flex flex-col items-center gap-0.5 rounded-md border px-3 py-3 transition-all",
            active
              ? "border-transparent text-white"
              : "border-border bg-surface-2 hover:border-border-strong",
          )}
          style={active ? { backgroundImage: BRAND_GRADIENT, boxShadow: "var(--shadow-grad)" } : undefined}
        >
          <div className="font-display text-[22px] font-semibold tracking-tight">{n}</div>
          <div className="text-[11px] opacity-85">{n === 1 ? "day" : "days"}</div>
        </button>
      );
    })}
  </div>
);

type BudgetSliderProps = { value: number; onChange: (v: number) => void };
const BudgetSlider = ({ value, onChange }: BudgetSliderProps) => {
  const { min, max, step } = BUDGET_RANGE_INR;
  const pct = (value - min) / (max - min);
  return (
    <div className="rounded-md border border-border bg-surface-2 px-4 py-3.5">
      <div className="mb-3 flex items-baseline justify-between">
        <div className="font-display text-2xl font-semibold tracking-tight text-ink">
          <span className="mr-px text-ink-soft">₹</span>
          {Math.round(value).toLocaleString("en-IN")}
        </div>
        <div className="text-[11px] tabular-nums text-ink-faint">
          {fmtInrK(min)} – {fmtInrK(max)}
        </div>
      </div>

      <div className="relative flex h-[22px] w-full items-center">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded bg-bg">
          <div
            className="h-full rounded"
            style={{ width: `${pct * 100}%`, backgroundImage: BRAND_GRADIENT }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value, 10))}
          className="absolute inset-0 z-10 h-full w-full cursor-pointer appearance-none bg-transparent opacity-0"
        />
        <div
          className="pointer-events-none absolute top-1/2 h-[18px] w-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
          style={{
            left: `${pct * 100}%`,
            boxShadow: "0 1px 4px rgba(15,23,42,0.18), 0 0 0 2px var(--color-indigo)",
          }}
        />
      </div>

      <div className="mt-2 flex justify-between text-[10px] tabular-nums text-ink-faint">
        {BUDGET_TICKS_INR.map((t) => (
          <span key={t}>{fmtInrK(t)}</span>
        ))}
      </div>
    </div>
  );
};

type StyleChipsProps = { value: TStyleKey[]; onChange: (v: TStyleKey[]) => void };
const StyleChips = ({ value, onChange }: StyleChipsProps) => {
  const toggle = (k: TStyleKey) => {
    const next = value.includes(k) ? value.filter((x) => x !== k) : [...value, k];
    if (next.length === 0) return;
    onChange(next);
  };
  return (
    <div className="flex flex-wrap gap-1.5">
      {STYLES.map((s) => {
        const active = value.includes(s.key);
        return (
          <button
            key={s.key}
            type="button"
            onClick={() => toggle(s.key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-[12.5px] font-medium transition-all",
              active
                ? "border-indigo/35 text-indigo-dark"
                : "border-border bg-surface-2 text-ink-2 hover:border-border-strong",
            )}
            style={active ? { backgroundImage: BRAND_GRADIENT_SOFT } : undefined}
          >
            <s.Icon size={12} />
            {s.key}
          </button>
        );
      })}
    </div>
  );
};

type PaceSelectorProps = { value: Pace; onChange: (v: Pace) => void };
const PaceSelector = ({ value, onChange }: PaceSelectorProps) => (
  <div className="grid grid-cols-3 gap-2">
    {PACES.map((p) => {
      const active = value === p.key;
      return (
        <button
          key={p.key}
          type="button"
          onClick={() => onChange(p.key)}
          className={cn(
            "flex flex-col items-center gap-1 rounded-md border px-2.5 py-3 transition-all",
            active
              ? "border-indigo/35"
              : "border-border bg-surface-2 hover:border-border-strong",
          )}
          style={active ? { backgroundImage: BRAND_GRADIENT_SOFT } : undefined}
        >
          <p.Icon size={18} className={cn(active ? "text-indigo" : "text-ink-faint")} />
          <div className="text-[13px] font-semibold text-ink">{p.label}</div>
          <div className="text-[10px] text-ink-soft">{p.sub}</div>
        </button>
      );
    })}
  </div>
);

type GroupSelectorProps = { value: TGroupKey; onChange: (v: TGroupKey) => void };
const GroupSelector = ({ value, onChange }: GroupSelectorProps) => (
  <div className="grid grid-cols-4 gap-1.5">
    {GROUPS.map((g) => {
      const active = value === g.key;
      return (
        <button
          key={g.key}
          type="button"
          onClick={() => onChange(g.key)}
          className={cn(
            "flex flex-col items-center gap-1 rounded-md border px-1.5 py-2.5 transition-all",
            active
              ? "border-indigo/35"
              : "border-border bg-surface-2 hover:border-border-strong",
          )}
          style={active ? { backgroundImage: BRAND_GRADIENT_SOFT } : undefined}
        >
          <g.Icon size={16} className={cn(active ? "text-indigo" : "text-ink-faint")} />
          <div className="text-[11px] font-medium text-ink-2">{g.key}</div>
        </button>
      );
    })}
  </div>
);

type AISummaryProps = {
  days: number;
  pace: Pace;
  styles: TStyleKey[];
  city: CityKey;
  budget: number;
  group: TGroupKey;
};
const AILiveSummary = ({ days, pace, styles, city, budget, group }: AISummaryProps) => {
  const cityName = CITY_VISUALS[city].displayName;
  const lower = styles.map((s) => s.toLowerCase());
  const styleStr =
    lower.length === 1
      ? lower[0]
      : lower.length === 2
        ? `${lower[0]} & ${lower[1]}`
        : `${lower.slice(0, -1).join(", ")} & ${lower.at(-1)}`;
  const groupStr = group === "Solo" ? "solo trip" : `${group.toLowerCase()} trip`;

  return (
    <div
      className="mt-[22px] flex gap-3 rounded-lg border px-4 py-3.5"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(91,91,240,0.06) 0%, rgba(139,92,246,0.06) 100%)",
        borderColor: "rgba(91,91,240,0.18)",
      }}
    >
      <div
        className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white"
        style={{ backgroundImage: BRAND_GRADIENT }}
      >
        <SparklesIcon size={14} />
      </div>
      <div className="text-[13px] leading-relaxed text-ink-2">
        Planning a <b className="font-semibold text-indigo-dark">{days}-day {pace}</b> {styleStr}{" "}
        {groupStr} to <b className="font-semibold text-indigo-dark">{cityName}</b> under{" "}
        <b className="font-semibold text-indigo-dark">{fmtInrK(budget)}</b>.
      </div>
    </div>
  );
};

type GenerateCtaProps = { onClick: () => void; busy?: boolean };
const GenerateCta = ({ onClick, busy }: GenerateCtaProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={busy}
    className="relative mt-4 flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-lg px-5 py-3.5 text-[14.5px] font-semibold tracking-tight text-white transition-all hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
    style={{ backgroundImage: BRAND_GRADIENT, boxShadow: "var(--shadow-grad)" }}
  >
    <SparklesIcon size={16} />
    Generate smart itinerary
    <span
      className="animate-shimmer pointer-events-none absolute inset-0 -translate-x-full"
      style={{
        backgroundImage:
          "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
      }}
    />
  </button>
);

type EmptyHintProps = { Icon: typeof RouteIcon; title: string; body: string };
const EmptyHint = ({ Icon, title, body }: EmptyHintProps) => (
  <div className="flex items-center gap-2.5 rounded-md border border-border bg-surface p-3 text-left text-[12.5px]">
    <Icon className="shrink-0 text-indigo" size={18} />
    <div>
      <b className="block text-[13px] font-semibold text-ink">{title}</b>
      <span className="text-ink-soft">{body}</span>
    </div>
  </div>
);

const EmptyState = () => (
  <div className="relative flex h-full flex-col items-center justify-center px-10 py-10 text-center">
    <div
      className="absolute h-[120px] w-[120px] rounded-full opacity-35 blur-[40px]"
      style={{ backgroundImage: BRAND_GRADIENT }}
    />
    <div
      className="animate-float relative mb-6 grid h-20 w-20 place-items-center rounded-3xl text-white"
      style={{ backgroundImage: BRAND_GRADIENT, boxShadow: "var(--shadow-grad)" }}
    >
      <WandIcon size={32} />
    </div>
    <h2 className="font-display mb-2 text-[28px] font-semibold tracking-tight text-ink">
      Your trip starts here.
    </h2>
    <p className="mb-7 max-w-[340px] text-[14.5px] text-ink-soft">
      Tell us where you're going, how long you have, and what you love — we'll plan a day-by-day
      itinerary that fits your time and budget.
    </p>
    <div className="grid w-full max-w-[420px] grid-cols-2 gap-2.5">
      <EmptyHint Icon={RouteIcon} title="Time-optimized" body="Stops within 2.4 km on average" />
      <EmptyHint Icon={WalletIcon} title="Budget-aware" body="Respects your daily caps" />
      <EmptyHint Icon={StarsIcon} title="Personalized" body="Built around your travel style" />
      <EmptyHint Icon={RefreshIcon} title="Regenerate freely" body="Lock the parts you love" />
    </div>
  </div>
);

// todo: all above components can be moved to separate files if needed, but for now keeping in one file for easier iteration
// as they are not exported somewhere

const PlannerShell = () => {
  const [city, setCity] = useState<CityKey>(CityKey.GOA);
  const [days, setDays] = useState<number>(3);
  const [budget, setBudget] = useState<number>(BUDGET_RANGE_INR.default);
  const [styles, setStyles] = useState<TStyleKey[]>(["Foodie", "Culture"]);
  const [pace, setPace] = useState<Pace>(Pace.BALANCED);
  const [group, setGroup] = useState<TGroupKey>("Couple");

  return (
    <div className="grid h-screen min-h-screen grid-cols-[1fr_minmax(420px,460px)] overflow-hidden">
      <div className="relative overflow-y-auto px-10 pb-20 pt-8">
        <EmptyState />
      </div>

      <div className="relative overflow-y-auto border-l border-border bg-surface px-7 pb-8 pt-7">
        <BrandHeader />

        <Section num={1} title="Destination">
          <DestinationPicker value={city} onChange={setCity} />
        </Section>

        <Section num={2} title="Number of days">
          <DaysSelector value={days} onChange={setDays} />
        </Section>

        <Section num={3} title="Budget">
          <BudgetSlider value={budget} onChange={setBudget} />
        </Section>

        <Section num={4} title="Travel style">
          <StyleChips value={styles} onChange={setStyles} />
        </Section>

        <Section num={5} title="Pace">
          <PaceSelector value={pace} onChange={setPace} />
        </Section>

        <Section num={6} title="Travel group">
          <GroupSelector value={group} onChange={setGroup} />
        </Section>

        <AILiveSummary days={days} pace={pace} styles={styles} city={city} budget={budget} group={group} />

        <GenerateCta
          onClick={() => {
            // TODO(PR3+): wire to itineraryApi.create + router.push(`/itinerary/${id}`)
          }}
        />
      </div>
    </div>
  );
};

export default PlannerShell;
