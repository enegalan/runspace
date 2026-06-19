import { SIDEBAR_WIDTH_MAX, SIDEBAR_WIDTH_MIN } from "../../core/layout/panelLayout";
import { usePointerDragResize } from "../../hooks/usePointerDragResize";
import { FileTree } from "../files/FileTree";
import { ResizeHandle } from "./ResizeHandle";
import type { CSSProperties } from "react";

interface SidebarProps {
  width: number;
  onWidthChange: (width: number) => void;
}

export function Sidebar({ width, onWidthChange }: SidebarProps) {
  const { currentSize, onPointerDown } = usePointerDragResize(width, onWidthChange, {
    min: SIDEBAR_WIDTH_MIN,
    max: SIDEBAR_WIDTH_MAX,
    side: "right",
  });

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
