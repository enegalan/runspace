import { isTauri } from "../platform/isTauri";

/**
 * Determines whether to use the HTTP API instead of the native API.
 * @returns `true` if the HTTP API should be used, `false` otherwise.
 */
export function shouldUseHttpApi(): boolean {
  return !isTauri() || import.meta.env.DEV;
}
