import { useRef } from "react";

type AsyncFn<TArgs extends unknown[]> = (
  ...args: [...TArgs, AbortSignal]
) => void | Promise<void>;

export function useDebouncedSearch<TArgs extends unknown[]>(
  fn: AsyncFn<TArgs>,
  delay: number = 300
) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  return (...args: TArgs) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();
    timerRef.current = setTimeout(() => {
      fn(...args, abortRef.current!.signal);
    }, delay);
  };
}
