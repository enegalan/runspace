import "@xterm/xterm/css/xterm.css";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { editorFontFamilyCss } from "../../core/constants/settingsDefaults";
import { readTerminalTheme } from "../../core/settings/applyAppSettings";
import { useSettingsStore } from "../../stores/settingsStore";

export interface XTermViewHandle {
  write: (data: string) => void;
  clear: () => void;
  fit: () => void;
  getCols: () => number;
  getRows: () => number;
}

interface XTermViewProps {
  onData: (data: string) => void;
  onResize?: (cols: number, rows: number) => void;
  onReady?: () => void;
}

function canOpen(container: HTMLDivElement): boolean {
  return container.isConnected && container.clientWidth > 0 && container.clientHeight > 0;
}

/**
 * The XTermView component.
 * @param onData - The function to call when data is received.
 * @param onResize - The function to call when the terminal is resized.
 * @param onReady - The function to call after the terminal opens.
 * @param ref - The ref.
 * @returns The XTermView component.
 */
export const XTermView = forwardRef<XTermViewHandle, XTermViewProps>(function XTermView(
  { onData, onResize, onReady },
  ref,
) {
  const settings = useSettingsStore((state) => state.settings);
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const openedRef = useRef(false);
  const callbacksRef = useRef({ onData, onResize, onReady });

  callbacksRef.current = { onData, onResize, onReady };

  const fit = () => {
    const container = containerRef.current;
    if (!openedRef.current || !container || !canOpen(container)) {
      return;
    }
    fitAddonRef.current?.fit();
  };

  useImperativeHandle(ref, () => ({
    write: (data: string) => {
      if (openedRef.current) {
        terminalRef.current?.write(data);
      }
    },
    clear: () => {
      if (openedRef.current) {
        terminalRef.current?.clear();
      }
    },
    fit,
    getCols: () => terminalRef.current?.cols ?? 80,
    getRows: () => terminalRef.current?.rows ?? 24,
  }));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    openedRef.current = false;

    const { editorFontFamily, editorFontSize } = useSettingsStore.getState().settings.appearance;
    const terminal = new Terminal({
      cursorBlink: true,
      fontFamily: editorFontFamilyCss(editorFontFamily),
      fontSize: editorFontSize,
      theme: readTerminalTheme(),
    });
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);

    let themeObserver: MutationObserver | undefined;
    let dataDisposable: { dispose: () => void } | undefined;
    let resizeDisposable: { dispose: () => void } | undefined;
    let resizeObserver: ResizeObserver | undefined;
    let openFrameId = 0;
    let readyFrameId = 0;
    let disposeFrameId = 0;

    const tryOpen = () => {
      if (openedRef.current || !canOpen(container)) {
        return;
      }

      terminal.open(container);
      openedRef.current = true;
      terminalRef.current = terminal;
      fitAddonRef.current = fitAddon;

      const applyTheme = () => {
        terminal.options.theme = readTerminalTheme();
      };
      themeObserver = new MutationObserver(applyTheme);
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });

      dataDisposable = terminal.onData((data) => {
        callbacksRef.current.onData(data);
      });
      resizeDisposable = terminal.onResize(({ cols, rows }) => {
        callbacksRef.current.onResize?.(cols, rows);
      });
      resizeObserver = new ResizeObserver(fit);
      resizeObserver.observe(container);

      readyFrameId = requestAnimationFrame(() => {
        fit();
        callbacksRef.current.onReady?.();
      });
    };

    const openObserver = new ResizeObserver(tryOpen);
    openObserver.observe(container);
    openFrameId = requestAnimationFrame(tryOpen);

    return () => {
      cancelAnimationFrame(openFrameId);
      cancelAnimationFrame(readyFrameId);
      cancelAnimationFrame(disposeFrameId);
      openObserver.disconnect();
      themeObserver?.disconnect();
      resizeObserver?.disconnect();
      dataDisposable?.dispose();
      resizeDisposable?.dispose();
      openedRef.current = false;
      terminalRef.current = null;
      fitAddonRef.current = null;
      const term = terminal;
      disposeFrameId = requestAnimationFrame(() => {
        term.dispose();
      });
    };
  }, []);

  useEffect(() => {
    const terminal = terminalRef.current;
    if (!terminal || !openedRef.current) {
      return;
    }

    terminal.options.fontFamily = editorFontFamilyCss(settings.appearance.editorFontFamily);
    terminal.options.fontSize = settings.appearance.editorFontSize;
    fit();
  }, [settings.appearance.editorFontFamily, settings.appearance.editorFontSize]);

  return <div ref={containerRef} className="xterm-view" data-testid="xterm-view" />;
});
