import { isTauri } from "../platform/isTauri";

export function shouldUseHttpApi(): boolean {
  return !isTauri() || import.meta.env.DEV;
}
