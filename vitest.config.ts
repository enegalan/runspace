import { readFileSync } from "node:fs";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const appPackage = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")) as {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  homepage: string;
  bugs: {
    url: string;
  };
  icon: string;
};

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_NAME__: JSON.stringify(appPackage.name[0].toUpperCase() + appPackage.name.slice(1)),
    __APP_DESCRIPTION__: JSON.stringify(appPackage.description),
    __APP_AUTHOR__: JSON.stringify(appPackage.author),
    __APP_LICENSE__: JSON.stringify(appPackage.license),
    __APP_HOMEPAGE__: JSON.stringify(appPackage.homepage),
    __APP_BUGS__: JSON.stringify(appPackage.bugs.url),
    __APP_GITHUB_URL__: JSON.stringify(appPackage.homepage),
    __APP_ISSUES_URL__: JSON.stringify(appPackage.bugs.url),
    __APP_ICON_URL__: JSON.stringify(appPackage.icon),
    __APP_VERSION__: JSON.stringify(appPackage.version),
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/unit/**/*.test.ts", "tests/unit/**/*.test.tsx"],
  },
});
