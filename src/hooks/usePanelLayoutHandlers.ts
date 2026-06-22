import { useCallback, type RefObject } from "react";
import { clamp } from "../core/clamp";
import {
  OUTPUT_WIDTH_MAX,
  OUTPUT_WIDTH_MIN,
  SIDEBAR_WIDTH_MAX,
  SIDEBAR_WIDTH_MIN,
  TERMINAL_HEIGHT_MAX,
  TERMINAL_HEIGHT_MIN,
} from "../core/constants/panelLayout";
import type { LayoutSettings } from "../core/types/settings";
import { useLayoutWidthPreview } from "./useLayoutWidthPreview";

interface UsePanelLayoutHandlersOptions {
  mainRowRef: RefObject<HTMLDivElement | null>;
  layoutSettings: LayoutSettings;
  updateSettings: (partial: { layout: Partial<LayoutSettings> }) => Promise<void>;
}

/**
 * The usePanelLayoutHandlers hook.
 * @param mainRowRef - The main row ref.
 * @param layoutSettings - The layout settings.
 * @param updateSettings - The function to call when the layout settings are updated.
 * @returns The usePanelLayoutHandlers hook.
 */
export function usePanelLayoutHandlers({
  mainRowRef,
  layoutSettings,
  updateSettings,
}: UsePanelLayoutHandlersOptions) {
  const { preview: previewSidebarWidth, clearPreview: clearSidebarWidthPreview } =
    useLayoutWidthPreview(
      mainRowRef,
      "--rs-sidebar-width-preview",
      SIDEBAR_WIDTH_MIN,
      SIDEBAR_WIDTH_MAX,
    );

  const { preview: previewOutputWidth, clearPreview: clearOutputWidthPreview } =
    useLayoutWidthPreview(
      mainRowRef,
      "--rs-output-width-preview",
      OUTPUT_WIDTH_MIN,
      OUTPUT_WIDTH_MAX,
    );

  const handleSidebarWidthChange = useCallback(
    (width: number) => {
      clearSidebarWidthPreview();
      void updateSettings({
        layout: {
          sidebarWidth: clamp(width, SIDEBAR_WIDTH_MIN, SIDEBAR_WIDTH_MAX),
        },
      });
    },
    [clearSidebarWidthPreview, updateSettings],
  );

  const handleOutputWidthChange = useCallback(
    (width: number) => {
      clearOutputWidthPreview();
      void updateSettings({
        layout: {
          outputWidth: clamp(width, OUTPUT_WIDTH_MIN, OUTPUT_WIDTH_MAX),
        },
      });
    },
    [clearOutputWidthPreview, updateSettings],
  );

  const handleTerminalHeightChange = useCallback(
    (height: number) => {
      void updateSettings({
        layout: {
          terminalHeight: clamp(height, TERMINAL_HEIGHT_MIN, TERMINAL_HEIGHT_MAX),
        },
      });
    },
    [updateSettings],
  );

  const handleToggleTerminal = useCallback(() => {
    void updateSettings({
      layout: { terminalVisible: !layoutSettings.terminalVisible },
    });
  }, [layoutSettings.terminalVisible, updateSettings]);

  const handleToggleSidebar = useCallback(() => {
    void updateSettings({
      layout: { sidebarVisible: !layoutSettings.sidebarVisible },
    });
  }, [layoutSettings.sidebarVisible, updateSettings]);

  const handleToggleOutput = useCallback(() => {
    void updateSettings({
      layout: { outputVisible: !layoutSettings.outputVisible },
    });
  }, [layoutSettings.outputVisible, updateSettings]);

  return {
    previewSidebarWidth,
    previewOutputWidth,
    handleSidebarWidthChange,
    handleOutputWidthChange,
    handleTerminalHeightChange,
    handleToggleTerminal,
    handleToggleSidebar,
    handleToggleOutput,
  };
}
