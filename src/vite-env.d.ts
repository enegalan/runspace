/// <reference types="vite/client" />

declare module "lang-map" {
  interface LangMapCache {
    extensions: Record<string, string[]>;
    languages: Record<string, string[]>;
  }

  interface LangMap {
    (): LangMapCache;
    languages(ext: string): string[];
    extensions(language: string): string[];
  }

  const langMap: LangMap;
  export default langMap;
}

declare const __APP_NAME__: string;
declare const __APP_VERSION__: string;
declare const __APP_DESCRIPTION__: string;
declare const __APP_AUTHOR__: string;
declare const __APP_LICENSE__: string;
declare const __APP_HOMEPAGE__: string;
declare const __APP_BUGS__: string;
declare const __APP_GITHUB_URL__: string;
declare const __APP_ISSUES_URL__: string;
declare const __APP_ICON_URL__: string;
