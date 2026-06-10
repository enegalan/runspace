import { FileTree } from "../files/FileTree";

export function Sidebar() {
  return (
    <aside className="sidebar" data-testid="sidebar">
      <FileTree />
    </aside>
  );
}
