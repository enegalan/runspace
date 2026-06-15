import {
  SIDEBAR_WIDTH_MAX,
  SIDEBAR_WIDTH_MIN,
} from "../../core/layout/panelLayout";
import { usePointerDragResize } from "../../hooks/usePointerDragResize";
import { FileTree } from "../files/FileTree";
import { ResizeHandle } from "./ResizeHandle";

interface SidebarProps {
  width: number;
  onWidthChange: (width: number) => void;
}

export function Sidebar({ width, onWidthChange }: SidebarProps) {
  const onResizePointerDown = usePointerDragResize(width, onWidthChange, {
    min: SIDEBAR_WIDTH_MIN,
    max: SIDEBAR_WIDTH_MAX,
    side: "right",
  });

  return (
    <div className="sidebar-shell" style={{ width }} data-testid="sidebar">
      <aside className="sidebar">
        <FileTree />
      </aside>
      <ResizeHandle
        side="right"
        onPointerDown={onResizePointerDown}
        data-testid="sidebar-resize-handle"
      />
    </div>
  );
}
