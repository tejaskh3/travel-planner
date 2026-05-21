"use client";

import { Fragment, useState } from "react";
import { cn } from "@/lib/cn.util";
import { fmtInr, usdToInr } from "@/lib/currency.util";
import { PreferenceCategory } from "@/api/itinerary/itinerary.enum";
import { CITY_VISUALS } from "@/modules/planner/planner.constants";
import { useItinerary } from "./hooks/use-itinerary.hook";
import type {
  ItineraryResponseDto,
  PlannedActivityDto,
  PlannedDayDto,
  TravelHopDto,
  TravelHopMode,
} from "@/api/itinerary/itinerary.dto";
import {
  BuildingIcon,
  CheckIcon,
  ChevIcon,
  GlassCheersIcon,
  type TIcon,
  MountainIcon,
  PinIcon,
  RefreshIcon,
  ShoppingBagIcon,
  SparklesIcon,
  UtensilsIcon,
  WalletIcon,
} from "@/icons/icons";

const CATEGORY_META: Readonly<
  Record<PreferenceCategory, { label: string; Icon: TIcon; grad: [string, string]; varColor: string; bg: string }>
> = {
  [PreferenceCategory.FOOD]: {
    label: "Food",
    Icon: UtensilsIcon,
    grad: ["#F59E0B", "#FBBF24"],
    varColor: "var(--color-cat-food)",
    bg: "var(--color-cat-food-bg)",
  },
  [PreferenceCategory.CULTURE]: {
    label: "Culture",
    Icon: BuildingIcon,
    grad: ["#5B5BF0", "#8B5CF6"],
    varColor: "var(--color-cat-culture)",
    bg: "var(--color-cat-culture-bg)",
  },
  [PreferenceCategory.OUTDOOR]: {
    label: "Outdoor",
    Icon: MountainIcon,
    grad: ["#16A37C", "#34D399"],
    varColor: "var(--color-cat-outdoor)",
    bg: "var(--color-cat-outdoor-bg)",
  },
  [PreferenceCategory.NIGHTLIFE]: {
    label: "Nightlife",
    Icon: GlassCheersIcon,
    grad: ["#8B5CF6", "#C084FC"],
    varColor: "var(--color-cat-nightlife)",
    bg: "var(--color-cat-nightlife-bg)",
  },
  [PreferenceCategory.SHOPPING]: {
    label: "Shopping",
    Icon: ShoppingBagIcon,
    grad: ["#DB2777", "#F472B6"],
    varColor: "var(--color-cat-shopping)",
    bg: "var(--color-cat-shopping-bg)",
  },
};

const HOP_MODE_META: Readonly<
  Record<TravelHopMode, { label: string; emoji: string; color: string; bg: string }>
> = {
  walk: { label: "Walk", emoji: "🚶", color: "#16A37C", bg: "rgba(22,163,124,0.10)" },
  metro: { label: "Metro", emoji: "🚆", color: "#5B5BF0", bg: "rgba(91,91,240,0.10)" },
  cab: { label: "Cab", emoji: "🚖", color: "#D97706", bg: "rgba(217,119,6,0.10)" },
  auto: { label: "Auto", emoji: "🛺", color: "#DB2777", bg: "rgba(219,39,119,0.10)" },
  bus: { label: "Bus", emoji: "🚌", color: "#8B5CF6", bg: "rgba(139,92,246,0.10)" },
  train: { label: "Train", emoji: "🚄", color: "#0EA5E9", bg: "rgba(14,165,233,0.10)" },
};

const formatDuration = (mins: number): string => {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};

const findHopBetween = (
  day: PlannedDayDto,
  fromActivityId: string,
  toActivityId: string,
): TravelHopDto | undefined =>
  day.travelHops?.find(
    (hop) => hop.fromActivityId === fromActivityId && hop.toActivityId === toActivityId,
  );

const AiBadge = ({ label = "AI" }: { label?: string }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-cat-culture-bg px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.06em] text-indigo-dark">
    <SparklesIcon size={9} />
    {label}
  </span>
);

type ThumbProps = { activity: PlannedActivityDto };
const ActivityThumb = ({ activity }: ThumbProps) => {
  const meta = CATEGORY_META[activity.category];
  return (
    <div className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-md">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(135deg, ${meta.grad[0]}, ${meta.grad[1]})`,
        }}
      />
      <div className="absolute right-0 top-0 h-10 w-10 -translate-y-2 translate-x-2 rounded-full bg-white/20" />
      <meta.Icon size={26} className="relative z-10 text-white" />
      <div className="absolute inset-x-1 bottom-1 z-10 rounded bg-ink/60 px-1 py-px text-center text-[10px] font-semibold tabular-nums text-white backdrop-blur-sm">
        {activity.startTime}
      </div>
    </div>
  );
};

type ActivityCardProps = { activity: PlannedActivityDto };
const ActivityCard = ({ activity }: ActivityCardProps) => {
  const meta = CATEGORY_META[activity.category];
  return (
    <a
      href={activity.mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative grid grid-cols-[80px_1fr] items-center gap-3.5 rounded-xl border border-border bg-white p-3.5 transition-all hover:-translate-y-px hover:border-border-strong hover:shadow-md"
    >
      <ActivityThumb activity={activity} />
      <div className="min-w-0">
        <div className="mb-1.5 text-[14.5px] font-semibold tracking-tight text-ink">
          {activity.name}
        </div>
        {activity.blurb && (
          <div className="mb-2 flex items-start gap-1.5 text-[12.5px] text-ink-soft">
            <AiBadge />
            <span className="line-clamp-2">{activity.blurb}</span>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3 text-[12px] text-ink-soft">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold"
            style={{ backgroundColor: meta.bg, color: meta.varColor }}
          >
            <span
              className="h-[5px] w-[5px] rounded-full"
              style={{ backgroundColor: meta.varColor }}
            />
            {meta.label}
          </span>
          <span>⏱ {formatDuration(activity.durationMinutes)}</span>
          <span>💸 {fmtInr(usdToInr(activity.costUsd))}</span>
          <span className="truncate text-ink-faint">{activity.address}</span>
        </div>
      </div>
    </a>
  );
};

type TravelHopRowProps = { hop: TravelHopDto };
const TravelHopRow = ({ hop }: TravelHopRowProps) => {
  const meta = HOP_MODE_META[hop.mode];
  if (!meta) return null;
  return (
    <div className="relative my-1 flex items-stretch gap-3 pl-7">
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-[39px] top-0 w-px border-l-2 border-dashed border-border"
      />
      <span
        aria-hidden
        className="relative grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border bg-white text-[14px] shadow-xs"
        style={{ color: meta.color }}
      >
        {meta.emoji}
      </span>
      <div className="flex min-w-0 flex-1 items-start gap-2 rounded-lg border border-border-soft bg-surface-2 px-3 py-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px]">
            <span
              className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10.5px] font-semibold"
              style={{ backgroundColor: meta.bg, color: meta.color }}
            >
              {meta.label}
            </span>
            <span className="font-semibold text-ink">
              {formatDuration(hop.durationMinutes)} on the way
            </span>
            <AiBadge />
          </div>
          {hop.tip && (
            <div className="mt-0.5 text-[12px] leading-snug text-ink-soft">{hop.tip}</div>
          )}
        </div>
      </div>
    </div>
  );
};

type DayHeaderProps = { day: PlannedDayDto };
const DayHeader = ({ day }: DayHeaderProps) => {
  const totalHopMinutes =
    day.travelHops?.reduce((acc, hop) => acc + hop.durationMinutes, 0) ?? 0;
  if (day.theme) {
    return (
      <div
        className="mb-5 overflow-hidden rounded-xl border p-4"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(91,91,240,0.10) 0%, rgba(139,92,246,0.10) 60%, rgba(255,255,255,0) 100%)",
          borderColor: "rgba(91,91,240,0.18)",
        }}
      >
        <div className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-indigo-dark">
          <SparklesIcon size={11} />
          AI Day Theme
        </div>
        <h3 className="font-display mt-1 text-2xl font-semibold tracking-tight text-ink">
          Day {day.dayNumber}: {day.theme}
        </h3>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-soft">
          <span>{day.activities.length} stops</span>
          {totalHopMinutes > 0 && (
            <>
              <span className="text-ink-ghost">·</span>
              <span>~{formatDuration(totalHopMinutes)} on the road</span>
            </>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="mb-5">
      <h3 className="font-display text-2xl font-semibold tracking-tight text-ink">
        Day {day.dayNumber}
      </h3>
      <div className="mt-1 text-[12px] text-ink-soft">{day.activities.length} stops</div>
    </div>
  );
};

type DayViewProps = { day: PlannedDayDto };
const DayView = ({ day }: DayViewProps) => {
  if (day.activities.length === 0) {
    return (
      <div
        className="flex gap-3 rounded-xl border p-6"
        style={{
          backgroundImage: "linear-gradient(135deg, #FEF3C7 0%, #FEE2E2 100%)",
          borderColor: "rgba(217, 119, 6, 0.25)",
        }}
      >
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-amber">
          !
        </div>
        <div>
          <h4 className="mb-1 text-[14px] font-semibold text-ink">This day couldn&apos;t be packed.</h4>
          <p className="text-[12.5px] text-ink-2">
            Try increasing the budget or relaxing the pace — there isn&apos;t enough room.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div>
      <DayHeader day={day} />
      <div className="space-y-2">
        {day.activities.map((activity, index) => {
          const next = day.activities[index + 1];
          const hop = next ? findHopBetween(day, activity.id, next.id) : undefined;
          return (
            <Fragment key={activity.id}>
              <ActivityCard activity={activity} />
              {hop && <TravelHopRow hop={hop} />}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};

type HeroProps = { result: ItineraryResponseDto };
const Hero = ({ result }: HeroProps) => {
  const visual = CITY_VISUALS[result.cityKey];
  const WeatherIcon = visual.weatherIcon;
  const totalInr = usdToInr(result.totalCostUsd);
  const budgetInr = usdToInr(result.budgetUsd);
  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-white shadow-md">
      <div className="relative h-44 overflow-hidden">
        <svg
          viewBox="0 0 800 200"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            <linearGradient id={`hero-${result.cityKey}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={visual.gradient[0]} />
              <stop offset="60%" stopColor={visual.gradient[1]} />
              <stop offset="100%" stopColor={visual.gradient[2]} />
            </linearGradient>
            <radialGradient id={`hero-gl-${result.cityKey}`} cx="0.75" cy="0.2" r="0.6">
              <stop offset="0%" stopColor="white" stopOpacity={0.35} />
              <stop offset="100%" stopColor="white" stopOpacity={0} />
            </radialGradient>
          </defs>
          <rect width={800} height={200} fill={`url(#hero-${result.cityKey})`} />
          <rect width={800} height={200} fill={`url(#hero-gl-${result.cityKey})`} />
          <circle cx={650} cy={55} r={28} fill="rgba(255,255,255,0.22)" />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-ink/40" />

        <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[12.5px] font-semibold text-ink shadow-xs backdrop-blur">
          <WeatherIcon size={14} className="text-amber" />
          {visual.weather.temp}°C · {visual.weather.label}
        </div>

        <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between text-white">
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight">
              {result.days.length} days in {result.cityName}
            </h1>
            <div className="mt-0.5 text-[13.5px] opacity-90">{visual.vibe}</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3">
        <div className="border-r border-border-soft p-4">
          <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
            Activities
          </div>
          <div className="font-display text-lg font-semibold tracking-tight text-ink">
            {result.days.reduce((s, d) => s + d.activities.length, 0)}{" "}
            <span className="font-sans text-[11px] font-medium text-ink-faint">stops</span>
          </div>
        </div>
        <div className="border-r border-border-soft p-4">
          <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
            Used
          </div>
          <div className="font-display text-lg font-semibold tracking-tight text-ink">
            {fmtInr(totalInr)}
          </div>
        </div>
        <div className="p-4">
          <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-faint">
            Budget
          </div>
          <div className="font-display text-lg font-semibold tracking-tight text-ink">
            {fmtInr(budgetInr)}
          </div>
        </div>
      </div>
    </div>
  );
};

type BudgetBreakdownProps = { result: ItineraryResponseDto };
const BudgetBreakdown = ({ result }: BudgetBreakdownProps) => {
  const budgetInr = usdToInr(result.budgetUsd);
  const foodInr = usdToInr(
    result.days.reduce(
      (s, d) =>
        s +
        d.activities
          .filter((a) => a.category === PreferenceCategory.FOOD)
          .reduce((x, a) => x + a.costUsd, 0),
      0,
    ),
  );
  const activitiesInr = usdToInr(
    result.days.reduce(
      (s, d) =>
        s +
        d.activities
          .filter((a) => a.category !== PreferenceCategory.FOOD)
          .reduce((x, a) => x + a.costUsd, 0),
      0,
    ),
  );
  const stayInr = Math.round(budgetInr * 0.5);
  const travelInr = Math.round(budgetInr * 0.1);
  const totalUsed = stayInr + travelInr + activitiesInr + foodInr;
  const pct = Math.min(100, Math.round((totalUsed / budgetInr) * 100));
  const over = totalUsed > budgetInr;

  const rows = [
    { label: "Stay (est.)", val: stayInr, color: "#5B5BF0" },
    { label: "Food", val: foodInr, color: "#D97706" },
    { label: "Activities", val: activitiesInr, color: "#16A37C" },
    { label: "Local travel (est.)", val: travelInr, color: "#8B5CF6" },
  ];

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <div className="mb-3 flex items-center gap-2">
        <WalletIcon size={16} className="text-indigo" />
        <div className="font-display text-[15px] font-semibold tracking-tight">
          Budget breakdown
        </div>
      </div>
      <div className="mb-3 flex items-baseline gap-2 border-b border-border-soft pb-3">
        <div className="font-display text-[26px] font-semibold tracking-tight">
          {fmtInr(totalUsed)}
        </div>
        <div className="text-sm text-ink-soft">/ {fmtInr(budgetInr)}</div>
        <span
          className={cn(
            "ml-auto rounded-full px-2.5 py-1 text-[11px] font-semibold",
            over ? "text-rose" : "text-success",
          )}
          style={{ backgroundColor: over ? "var(--color-rose-soft)" : "var(--color-success-soft)" }}
        >
          {over ? `Over by ${fmtInr(totalUsed - budgetInr)}` : `${pct}% used`}
        </span>
      </div>
      {rows.map((r) => {
        const w = Math.min(100, (r.val / budgetInr) * 100);
        return (
          <div key={r.label} className="mb-3 last:mb-0">
            <div className="mb-1 flex justify-between text-[12.5px]">
              <b className="font-semibold text-ink-2">{r.label}</b>
              <span className="tabular-nums text-ink">{fmtInr(r.val)}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded bg-bg">
              <div
                className="h-full rounded transition-all"
                style={{ width: `${w}%`, backgroundColor: r.color }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

type InsightsProps = { result: ItineraryResponseDto };
const SmartInsights = ({ result }: InsightsProps) => {
  const [open, setOpen] = useState(false);
  const totalInr = usdToInr(result.totalCostUsd);
  const budgetInr = usdToInr(result.budgetUsd);
  const withinBudget = totalInr <= budgetInr;
  const stopCount = result.days.reduce((s, d) => s + d.activities.length, 0);

  const rows = [
    { ok: true, t: "Optimized to reduce travel time", d: "Adjacent stops are clustered geographically." },
    {
      ok: withinBudget,
      t: withinBudget ? "Within your budget" : "Over budget — consider relaxing pace",
      d: `${fmtInr(totalInr)} of ${fmtInr(budgetInr)} used.`,
    },
    { ok: true, t: `${stopCount} stops across ${result.days.length} day${result.days.length > 1 ? "s" : ""}`, d: "Balanced morning-to-evening." },
  ];

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <div className="mb-3 flex items-center gap-2">
        <SparklesIcon size={16} className="text-indigo" />
        <div className="font-display text-[15px] font-semibold tracking-tight">
          Smart AI insights
        </div>
      </div>
      {rows.map((r, i) => (
        <div
          key={i}
          className="flex items-start gap-2.5 border-b border-border-soft py-2 text-[13px] last:border-none"
        >
          <CheckIcon
            size={14}
            className={cn("mt-0.5 shrink-0", r.ok ? "text-success" : "text-amber")}
          />
          <div>
            <b className="font-semibold text-ink">{r.t}</b>
            <br />
            <span className="text-ink-soft">{r.d}</span>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mt-3 flex w-full items-center justify-between rounded-md border px-3 py-2.5 text-[12.5px] font-semibold text-indigo-dark transition-all"
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(91,91,240,0.10) 0%, rgba(139,92,246,0.10) 100%)",
          borderColor: "rgba(91,91,240,0.2)",
        }}
      >
        <span className="inline-flex items-center gap-1.5">
          <SparklesIcon size={12} />
          Why this recommendation?
        </span>
        <ChevIcon size={14} className={cn("transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="animate-fade-slide mt-2 rounded-md border border-border-soft bg-surface-2 p-3.5 text-[12.5px] leading-relaxed text-ink-2">
          Activities sorted by your travel styles and packed greedily — the first stop that fits
          remaining time and budget gets added. {result.days.length} day
          {result.days.length > 1 ? "s" : ""} packed within{" "}
          <strong className="font-semibold text-ink">{fmtInr(budgetInr)}</strong>.
        </div>
      )}
    </div>
  );
};

const Skeleton = () => (
  <div className="animate-pulse">
    <div className="mb-6 h-44 rounded-2xl bg-ink-ghost/20" />
    <div className="mb-3 h-9 w-48 rounded bg-ink-ghost/20" />
    <div className="mb-2.5 h-24 rounded-xl bg-ink-ghost/20" />
    <div className="mb-2.5 h-24 rounded-xl bg-ink-ghost/20" />
    <div className="mb-2.5 h-24 rounded-xl bg-ink-ghost/20" />
  </div>
);

// todo : above comoponets can be saved in different files, kept here for easier development and refactoring. Also, can add more insights like "most expensive stop", "longest stop", etc.
type Props = { id: string };
export const ItineraryView = ({ id }: Props) => {
  const { data: result, isLoading, isError, error, refetch } = useItinerary(id);
  const [activeDay, setActiveDay] = useState(0);

  if (isLoading) return <Skeleton />;

  if (isError) {
    return (
      <div className="rounded-xl border border-rose/30 bg-rose-soft p-6">
        <h3 className="mb-2 font-display text-lg font-semibold text-rose">
          Couldn&apos;t load itinerary
        </h3>
        <p className="mb-4 text-[13px] text-ink-2">{error?.message ?? "Unknown error"}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-1.5 rounded-md border border-rose/40 bg-white px-3 py-1.5 text-[12.5px] font-semibold text-rose"
        >
          <RefreshIcon size={13} />
          Retry
        </button>
      </div>
    );
  }

  if (!result) return null;

  if (result.unfitReason) {
    return (
      <>
        <Hero result={result} />
        <div
          className="flex gap-3 rounded-xl border p-6"
          style={{
            backgroundImage: "linear-gradient(135deg, #FEF3C7 0%, #FEE2E2 100%)",
            borderColor: "rgba(217, 119, 6, 0.25)",
          }}
        >
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-amber">
            <PinIcon size={18} />
          </div>
          <div>
            <h4 className="mb-1 text-[14px] font-semibold text-ink">
              Couldn&apos;t generate this trip.
            </h4>
            <p className="text-[12.5px] text-ink-2">{result.unfitReason}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="animate-fade-up">
      <Hero result={result} />
      <div className="mb-4 inline-flex gap-1.5 rounded-md border border-border bg-white p-1">
        {result.days.map((d, i) => (
          <button
            key={d.dayNumber}
            type="button"
            onClick={() => setActiveDay(i)}
            className={cn(
              "rounded-lg px-3.5 py-2 text-[12.5px] font-semibold transition-all",
              activeDay === i ? "bg-ink text-white" : "text-ink-soft hover:bg-surface-2",
            )}
          >
            Day {d.dayNumber}
            <span className="ml-1.5 text-[11px] opacity-70">
              {fmtInr(usdToInr(d.subtotalUsd))}
            </span>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        <DayView day={result.days[activeDay]} />
        <div className="flex flex-col gap-4 xl:sticky xl:top-8">
          <SmartInsights result={result} />
          <BudgetBreakdown result={result} />
        </div>
      </div>
    </div>
  );
};
