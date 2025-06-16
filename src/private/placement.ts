import type { Placement } from './mapbox-types';

const POLLING_INTERVAL_IN_MS = 30;

/**
 * Waits until the placement finishes.
 *
 * @param placement -
 *
 *   Placement object to be checked.
 *
 * @param timeoutInMs -
 *
 *   Timeout in milliseconds.
 *
 * @throws Error
 *
 *   If `placement` does not finish before `timeoutInMs` elapses.
 *
 * @beta
 */
export async function waitForPlacement(
  placement: Placement,
  timeoutInMs: number,
): Promise<void> {
  if (!placement.stale) {
    return;
  }
  let intervalId: ReturnType<typeof setInterval>;
  return new Promise<void>((resolve, reject) => {
    const stopTime = Date.now() + timeoutInMs;
    let retryCount = Math.floor(timeoutInMs / POLLING_INTERVAL_IN_MS);
    intervalId = setInterval(() => {
      if (!placement.stale) {
        resolve();
      }
      // checks both elapsed time and number of retries to address the following
      // situations
      // - clock rewinding → incorrect elapsed time
      // - process suspension → incorrect retry count
      --retryCount;
      if (Date.now() > stopTime || retryCount <= 0) {
        reject(new Error('placement timed out'));
      }
    }, POLLING_INTERVAL_IN_MS);
  })
    .finally(() => {
      // makes sure that the interval stops.
      clearInterval(intervalId);
    });
}
