import { useEffect, useId, useRef, useState } from "react";
import { publicUrl } from "../publicUrl";
import { DEFAULT_PERIOD_LABEL } from "../types/document";
import { CalendarIcon } from "./ui/Icons";
import styles from "./DateRangePicker.module.css";

export type PeriodRange = "Q1" | "Q2" | "Q3" | "Q4" | "H1" | "H2" | "YEAR";

const QUARTERS: PeriodRange[] = ["Q1", "Q2", "Q3", "Q4"];
const HALVES: PeriodRange[] = ["H1", "H2"];

const BUBBLE_PATH =
  "M164 21 C167.3137083053589 21 169.99999987114455 23.686291694641113 170 27 L170 175 C169.99999793838128 178.31370663642883 167.313707113266 180.99999985101078 164 181 L6 181 C2.6862916946411133 181 1.2885543299034907e-7 178.3137083053589 0 175 L0 27 C0.000002061685790977208 23.686293363571167 2.686292886734009 21.000000148984412 6 21 L67 21 L83 0 L99 21 L164 21 Z";

export function parsePeriodLabel(label: string): {
  range: PeriodRange | null;
  year: number;
} {
  const trimmed = label.trim();
  const quarterOrHalf = trimmed.match(/^(Q[1-4]|H[12])\s+(\d{4})$/i);
  if (quarterOrHalf) {
    return {
      range: quarterOrHalf[1].toUpperCase() as PeriodRange,
      year: Number(quarterOrHalf[2]),
    };
  }
  const yearOnly = trimmed.match(/^(\d{4})$/);
  if (yearOnly) {
    return { range: "YEAR", year: Number(yearOnly[1]) };
  }
  return { range: null, year: new Date().getFullYear() };
}

export function formatPeriodLabel(range: PeriodRange, year: number): string {
  return range === "YEAR" ? String(year) : `${range} ${year}`;
}

function yearOptions(selected: number): number[] {
  const now = new Date().getFullYear();
  const start = Math.min(selected, now) - 8;
  const end = Math.max(selected, now) + 5;
  const years: number[] = [];
  for (let year = start; year <= end; year += 1) years.push(year);
  return years;
}

type DateRangePickerProps = {
  periodLabel: string;
  onPeriodChange: (label: string) => void;
};

export function DateRangePicker({
  periodLabel,
  onPeriodChange,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);
  const clipId = `date-picker-${useId().replace(/:/g, "")}`;
  const rootRef = useRef<HTMLDivElement>(null);
  const { range, year } = parsePeriodLabel(periodLabel);
  const years = yearOptions(year);
  const selected = range !== null;
  const displayLabel = selected ? periodLabel : DEFAULT_PERIOD_LABEL;

  useEffect(() => {
    if (!open) {
      setYearOpen(false);
      return;
    }
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const selectRange = (next: PeriodRange) => {
    onPeriodChange(formatPeriodLabel(next, year));
    setOpen(false);
  };

  const selectYear = (next: number) => {
    onPeriodChange(range ? formatPeriodLabel(range, next) : String(next));
    setYearOpen(false);
  };

  return (
    <div className={styles.root} ref={rootRef} data-layout="period">
      <div className={styles.anchor}>
      <button
        type="button"
        className={styles.trigger}
        aria-label={displayLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <CalendarIcon />
        <span
          className={`${styles.label}${selected ? "" : ` ${styles.labelMuted}`}`}
          data-layout="period-label"
        >
          {displayLabel}
        </span>
      </button>
      {open ? (
        <div
          className={styles.picker}
          role="dialog"
          aria-label="Date range"
          data-layout="date-picker"
        >
          <svg
            className={styles.frame}
            width={170}
            height={181}
            viewBox="0 0 170 181"
            aria-hidden
          >
            <defs>
              <clipPath id={clipId}>
                <path d={BUBBLE_PATH} />
              </clipPath>
            </defs>
            <g clipPath={`url(#${clipId})`}>
              <path className={styles.bubble} d={BUBBLE_PATH} />
            </g>
          </svg>
          <div className={styles.content}>
              <div className={styles.yearSelect}>
                <button
                  type="button"
                  className={styles.yearTrigger}
                  aria-label="Year"
                  aria-haspopup="listbox"
                  aria-expanded={yearOpen}
                  style={{
                    ["--dropdown-mask" as string]: `url("${publicUrl("assets/dropdown.svg")}")`,
                  }}
                  onClick={() => setYearOpen((prev) => !prev)}
                >
                  <span className={styles.yearLabel}>{year}</span>
                </button>
                {yearOpen ? (
                  <div className={styles.yearMenu} role="listbox" aria-label="Year">
                    {years.map((option) => (
                      <div
                        key={option}
                        role="option"
                        aria-selected={option === year}
                        className={styles.yearOption}
                        onClick={() => selectYear(option)}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className={styles.row}>
                {QUARTERS.map((quarter) => (
                  <DateCell
                    key={quarter}
                    label={quarter}
                    selected={range === quarter}
                    onSelect={() => selectRange(quarter)}
                  />
                ))}
              </div>
              <div className={styles.row}>
                {HALVES.map((half) => (
                  <DateCell
                    key={half}
                    label={half}
                    selected={range === half}
                    onSelect={() => selectRange(half)}
                  />
                ))}
              </div>
              <div className={styles.row}>
                <DateCell
                  label="YEAR"
                  selected={range === "YEAR"}
                  onSelect={() => selectRange("YEAR")}
                />
              </div>
            </div>
        </div>
      ) : null}
      </div>
    </div>
  );
}

function DateCell({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`${styles.cell}${selected ? ` ${styles.cellSelected}` : ""}`}
      aria-pressed={selected}
      onClick={onSelect}
    >
      {label}
    </button>
  );
}
