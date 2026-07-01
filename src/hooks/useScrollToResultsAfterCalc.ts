import { useCallback, useEffect, useRef } from 'react';

export function useScrollToResultsAfterCalc(
  isCalculating: boolean,
  showResults: boolean,
) {
  const resultsRef = useRef<HTMLElement>(null);
  const scrollAfterCalc = useRef(false);

  useEffect(() => {
    if (isCalculating || !scrollAfterCalc.current) return;
    if (!showResults) {
      scrollAfterCalc.current = false;
      return;
    }
    scrollAfterCalc.current = false;
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [isCalculating, showResults]);

  const markScrollAfterCalc = useCallback(() => {
    scrollAfterCalc.current = true;
  }, []);

  return { resultsRef, markScrollAfterCalc };
}
