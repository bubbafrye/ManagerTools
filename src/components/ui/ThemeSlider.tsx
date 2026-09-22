import { useRef, type PointerEvent } from "react";
import styles from "./ThemeSlider.module.css";

type ThemeSliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
};

function valueFromClientX(
  clientX: number,
  rect: DOMRect,
  min: number,
  max: number,
) {
  const ratio = rect.width <= 0 ? 0 : (clientX - rect.left) / rect.width;
  const clamped = Math.min(1, Math.max(0, ratio));
  return Math.round(min + clamped * (max - min));
}

export function ThemeSlider({
  label,
  value,
  min,
  max,
  onChange,
}: ThemeSliderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const trackRef = useRef<DOMRect | null>(null);

  const scrub = (clientX: number) => {
    const rect = trackRef.current;
    if (!rect) return;
    const next = valueFromClientX(clientX, rect, min, max);
    if (next !== value) onChange(next);
  };

  const onPointerDown = (event: PointerEvent<HTMLInputElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    const input = event.currentTarget;
    trackRef.current = input.getBoundingClientRect();
    try {
      input.setPointerCapture(event.pointerId);
    } catch {
      /* untrusted / test events */
    }
    input.focus();
    scrub(event.clientX);
  };

  const onPointerMove = (event: PointerEvent<HTMLInputElement>) => {
    const captured = event.currentTarget.hasPointerCapture(event.pointerId);
    if (!captured && event.buttons !== 1) return;
    if (!trackRef.current) {
      trackRef.current = event.currentTarget.getBoundingClientRect();
    }
    scrub(event.clientX);
  };

  const onPointerUp = (event: PointerEvent<HTMLInputElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    trackRef.current = null;
  };

  return (
    <label className={styles.slider}>
      <span className={styles.label}>{label}</span>
      <input
        ref={inputRef}
        className={styles.range}
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        aria-label={label}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onChange={(event) => onChange(Number.parseInt(event.target.value, 10))}
      />
    </label>
  );
}
