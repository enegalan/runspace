import "@xterm/xterm/css/xterm.css";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { readTerminalTheme } from "../../core/settings/applyAppSettings";

export interface XTermViewHandle {
  write: (data: string) => void;
  clear: () => void;
  fit: () => void;
  focus: () => void;
  getCols: () => number;
  getRows: () => number;
}

interface XTermViewProps {
  onData: (data: string) => void;
  onResize?: (cols: number, rows: number) => void;
}

export const XTermView = forwardRef<XTermViewHandle, XTermViewProps>(
  function XTermView({ onData, onResize }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const terminalRef = useRef<Terminal | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const onDataRef = useRef(onData);
    const onResizeRef = useRef(onResize);

    onDataRef.current = onData;
    onResizeRef.current = onResize;

    useImperativeHandle(ref, () => ({
      write: (data: string) => {
        terminalRef.current?.write(data);
      },
      clear: () => {
        terminalRef.current?.clear();
      },
      fit: () => {
        fitAddonRef.current?.fit();
      },
      focus: () => {
        terminalRef.current?.focus();
      },
      getCols: () => terminalRef.current?.cols ?? 80,
      getRows: () => terminalRef.current?.rows ?? 24,
    }));

    useEffect(() => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      const terminal = new Terminal({
        cursorBlink: true,
        fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 12,
        lineHeight: 1.3,
        theme: readTerminalTheme(),
        scrollback: 1000,
      });
      const fitAddon = new FitAddon();
      terminal.loadAddon(fitAddon);
      terminal.open(container);
      fitAddon.fit();
      terminal.focus();

      const applyTheme = () => {
        terminal.options.theme = readTerminalTheme();
      };
      const themeObserver = new MutationObserver(applyTheme);
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });

      const dataDisposable = terminal.onData((data) => {
        onDataRef.current(data);
      });
      const resizeDisposable = terminal.onResize(({ cols, rows }) => {
        onResizeRef.current?.(cols, rows);
      });

      terminalRef.current = terminal;
      fitAddonRef.current = fitAddon;

      const resizeObserver = new ResizeObserver(() => {
        fitAddon.fit();
        onResizeRef.current?.(terminal.cols, terminal.rows);
      });
      resizeObserver.observe(container);

      return () => {
        themeObserver.disconnect();
        resizeObserver.disconnect();
        dataDisposable.dispose();
        resizeDisposable.dispose();
        terminal.dispose();
        terminalRef.current = null;
        fitAddonRef.current = null;
      };
    }, []);

    return (
      <div
        ref={containerRef}
        className="xterm-view"
        data-testid="xterm-view"
      />
    );
  },
);
