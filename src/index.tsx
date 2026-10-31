'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
export interface Step {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
  validate?: (options: {
    signal: AbortSignal;
    from: number;
    to: number;
  }) => boolean | string | Promise<boolean | string>;
}
export interface StepperProps {
  steps?: readonly Step[];
  activeStep?: number;
  defaultStep?: number;
  onStepChange?: (index: number) => void;
  onComplete?: () => void | Promise<void>;
  linear?: boolean;
  label?: string;
  className?: string;
}
export function Stepper({
  steps = [],
  activeStep: controlled,
  defaultStep = 0,
  onStepChange,
  onComplete,
  linear = true,
  label = 'Progress',
  className,
}: StepperProps) {
  if (steps.length > 100 || new Set(steps.map((step) => step.id)).size !== steps.length)
    throw new TypeError('At most100 uniquely identified steps are allowed.');
  const [internal, setStep] = useState(defaultStep);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const controller = useRef<AbortController | null>(null);
  const alive = useRef(false);
  const requested = controlled ?? internal;
  if (!Number.isInteger(requested) || requested < 0) throw new RangeError('Invalid active step.');
  const index = Math.min(requested, Math.max(0, steps.length - 1));
  const current = steps[index];
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      controller.current?.abort();
    };
  }, []);
  const go = async (to: number) => {
    if (!current || controller.current || to < 0 || to > steps.length || steps[to]?.disabled)
      return;
    if (linear && to > index + 1) return;
    const active = new AbortController();
    controller.current = active;
    setBusy(true);
    setError(null);
    try {
      if (to > index) {
        const result = await current.validate?.({ signal: active.signal, from: index, to });
        if (result === false || typeof result === 'string') {
          if (alive.current)
            setError(typeof result === 'string' ? result : 'Complete the current step.');
          return;
        }
      }
      if (!alive.current || active.signal.aborted) return;
      if (to > index) setCompleted((previous) => new Set([...previous, current.id]));
      if (to === steps.length) {
        await onComplete?.();
        return;
      }
      if (controlled === undefined) setStep(to);
      onStepChange?.(to);
    } catch (reason) {
      if (alive.current && !active.signal.aborted)
        setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      if (controller.current === active) {
        controller.current = null;
        if (alive.current) setBusy(false);
      }
    }
  };
  return (
    <section className={className} aria-label={label} aria-busy={busy || undefined}>
      <ol aria-label={label} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {steps.map((step, position) => (
          <li key={step.id}>
            <button
              type="button"
              disabled={
                busy || step.disabled || (linear && position > index && !completed.has(step.id))
              }
              aria-current={position === index ? 'step' : undefined}
              onClick={() => void go(position)}
            >
              {step.label}
            </button>
          </li>
        ))}
      </ol>
      {current && <div aria-label={current.label}>{current.content}</div>}
      {error && <p role="alert">{error}</p>}
      <button type="button" disabled={busy || index === 0} onClick={() => void go(index - 1)}>
        Previous
      </button>
      <button type="button" disabled={busy || !current} onClick={() => void go(index + 1)}>
        {index === steps.length - 1 ? 'Finish' : 'Next'}
      </button>
      {busy && (
        <button
          type="button"
          onClick={() => {
            controller.current?.abort();
            controller.current = null;
            setBusy(false);
          }}
        >
          Cancel
        </button>
      )}
    </section>
  );
}
export default Stepper;
