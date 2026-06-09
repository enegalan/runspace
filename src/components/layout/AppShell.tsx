import { EditorArea } from "./EditorArea";
import { OutputPanel } from "./OutputPanel";
import { Sidebar } from "./Sidebar";
import { StatusBar } from "./StatusBar";
import { Toolbar } from "./Toolbar";

export function AppShell() {
  return (
    <div className="app-shell" data-testid="app-shell">
      <Toolbar />
      <div className="main-row">
        <Sidebar />
        <EditorArea />
        <OutputPanel />
      </div>
      <StatusBar />
    </div>
  );
}
