import { SIDEBAR_WIDTH_MAX, SIDEBAR_WIDTH_MIN } from "../../core/constants/panelLayout";
import { usePointerDragResize } from "../../hooks/usePointerDragResize";
import { FileTree } from "../files/FileTree";
import { ResizeHandle } from "./ResizeHandle";
import type { CSSProperties } from "react";

interface SidebarProps {
  width: number;
  onWidthChange: (width: number) => void;
  onWidthCommit: (width: number) => void;
}

/**
 * The Sidebar component.
 * @param width - The width of the sidebar.
 * @param onWidthChange - The function to call when the width changes.
 * @param onWidthCommit - The function to call when the width is committed.
 * @returns The Sidebar component.
 */
export function Sidebar({ width, onWidthChange, onWidthCommit }: SidebarProps) {
  const { currentSize, onPointerDown } = usePointerDragResize(
    width,
    {
      min: SIDEBAR_WIDTH_MIN,
      max: SIDEBAR_WIDTH_MAX,
      side: "right",
    },
    onWidthChange,
    onWidthCommit,
  );

  const panelStyle = { "--rs-panel-width": `${currentSize}px` } as CSSProperties;

  return (
    <div className="sidebar-shell" style={panelStyle} data-testid="sidebar">
      <aside className="sidebar">
        <FileTree />
      </aside>
      <ResizeHandle
        side="right"
        onPointerDown={onPointerDown}
        data-testid="sidebar-resize-handle"
      />
    </div>
  );
}
