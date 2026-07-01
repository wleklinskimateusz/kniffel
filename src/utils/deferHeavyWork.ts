import { flushSync } from 'react-dom';

/** Run work after React commits and the browser has painted (fixes mobile loading UI). */
export function deferHeavyWork(onLoading: () => void, work: () => void): void {
  flushSync(onLoading);
  requestAnimationFrame(() => {
    requestAnimationFrame(work);
  });
}
