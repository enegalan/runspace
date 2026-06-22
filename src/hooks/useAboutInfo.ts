import { getName, getTauriVersion, getVersion } from "@tauri-apps/api/app";
import { useEffect, useState } from "react";
import { APP_AUTHOR, APP_LICENSE, APP_NAME, APP_VERSION } from "../core/constants/appMetadata";
import { isTauri } from "../core/platform/isTauri";

interface AboutInfo {
  appName: string;
  version: string;
  tauriVersion: string | null;
  copyrightYear: number;
  author: string;
  license: string;
}

/**
 * The default information about the app.
 * @returns The default information about the app.
 */
const DEFAULT_INFO: AboutInfo = {
  appName: APP_NAME,
  version: APP_VERSION,
  tauriVersion: null,
  copyrightYear: new Date().getFullYear(),
  author: APP_AUTHOR,
  license: APP_LICENSE,
};

/**
 * This hook is used to get the information about the app.
 * @param open - Whether the about dialog is open.
 * @returns The information about the app.
 */
export function useAboutInfo(open: boolean): AboutInfo {
  const [info, setInfo] = useState<AboutInfo>(DEFAULT_INFO);

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    async function loadAboutInfo() {
      const copyrightYear = new Date().getFullYear();

      if (!isTauri()) {
        setInfo({ ...DEFAULT_INFO, copyrightYear });
        return;
      }

      try {
        const [appName, version, tauriVersion] = await Promise.all([
          getName(),
          getVersion(),
          getTauriVersion(),
        ]);

        if (cancelled) {
          return;
        }

        setInfo({
          appName,
          version,
          tauriVersion,
          copyrightYear,
          author: APP_AUTHOR,
          license: APP_LICENSE,
        });
      } catch {
        if (!cancelled) {
          setInfo({ ...DEFAULT_INFO, copyrightYear });
        }
      }
    }

    void loadAboutInfo();

    return () => {
      cancelled = true;
    };
  }, [open]);

  return info;
}
