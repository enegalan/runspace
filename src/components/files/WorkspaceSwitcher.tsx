import { useEffect, useRef, useState } from "react";
import { requireWorkspaceName } from "../../core/workspace/promptWorkspaceName";
import type { WorkspaceInfo } from "../../core/types/workspace";
import { useDialogStore } from "../../stores/dialogStore";
import { useEnvironmentStore } from "../../stores/environmentStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { ContextMenu } from "../ui/ContextMenu";
import { IconChevronDown, IconPlus } from "../ui/icons";

interface WorkspaceMenuState {
  x: number;
  y: number;
  item: WorkspaceInfo;
}

export function WorkspaceSwitcher() {
  const workspace = useWorkspaceStore((state) => state.workspace);
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const selectedRuntimeId = useEnvironmentStore((state) => state.selectedId);
  const runtimeId = workspace?.runtime_id ?? selectedRuntimeId;
  const switchWorkspace = useWorkspaceStore((state) => state.switchWorkspace);
  const createWorkspace = useWorkspaceStore((state) => state.createWorkspace);
  const renameWorkspace = useWorkspaceStore((state) => state.renameWorkspace);
  const deleteWorkspace = useWorkspaceStore((state) => state.deleteWorkspace);
  const loadWorkspaces = useWorkspaceStore((state) => state.loadWorkspaces);
  const askConfirm = useDialogStore((state) => state.askConfirm);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [workspaceMenu, setWorkspaceMenu] = useState<WorkspaceMenuState | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const filteredWorkspaces = search.trim()
    ? workspaces.filter((item) =>
        item.name.toLowerCase().includes(search.trim().toLowerCase()),
      )
    : workspaces;

  useEffect(() => {
    if (!runtimeId) {
      return;
    }
    void loadWorkspaces(runtimeId);
  }, [runtimeId, workspace?.id, loadWorkspaces]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const handleCreateWorkspace = async () => {
    if (!runtimeId) {
      return;
    }

    try {
      const workspaceName = await requireWorkspaceName("Name for the new workspace");
      if (!workspaceName) {
        return;
      }
      setOpen(false);
      await createWorkspace(runtimeId, workspaceName);
    } catch (error) {
      console.error("Failed to create workspace:", error);
      const message =
        error instanceof Error ? error.message : "Failed to create workspace";
      await askConfirm(message, { confirmLabel: "OK" });
    }
  };

  const handleRenameWorkspace = async (item: WorkspaceInfo) => {
    const name = await requireWorkspaceName("Rename workspace", item.name);
    if (!name || name === item.name) {
      return;
    }
    await renameWorkspace(item.id, name);
  };

  const handleDeleteWorkspace = async (item: WorkspaceInfo) => {
    const confirmed = await askConfirm(`Delete workspace "${item.name}"?`, {
      confirmLabel: "Delete",
      danger: true,
    });
    if (!confirmed) {
      return;
    }
    setOpen(false);
    setWorkspaceMenu(null);
    try {
      await deleteWorkspace(item.id);
    } catch (error) {
      console.error("Failed to delete workspace:", error);
      const message =
        error instanceof Error ? error.message : "Failed to delete workspace";
      await askConfirm(message, { confirmLabel: "OK" });
    }
  };

  return (
    <div
      ref={rootRef}
      className={`workspace-switcher${open ? " workspace-switcher--open" : ""}`}
      data-testid="workspace-switcher"
    >
      <button
        type="button"
        className="workspace-switcher__trigger"
        onClick={() => setOpen((prev) => !prev)}
        title={workspace?.name ?? "Create workspace..."}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="workspace-switcher__label">
          {workspace?.name ?? "Create workspace..."}
        </span>
        <IconChevronDown size={14} className="workspace-switcher__chevron" />
      </button>

      {open && (
        <div className="workspace-switcher__menu" role="listbox">
          {workspaces.length > 3 && (
            <div className="workspace-switcher__search">
              <input
                type="search"
                className="workspace-switcher__search-input"
                placeholder="Filter workspaces..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                autoFocus
              />
            </div>
          )}
          <div className="workspace-switcher__heading">Workspaces</div>
          <ul className="workspace-switcher__list">
            {filteredWorkspaces.map((item) => (
              <li
                key={item.id}
                className="workspace-switcher__item"
                role="option"
                aria-selected={item.id === workspace?.id}
                onContextMenu={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setWorkspaceMenu({
                    x: event.clientX,
                    y: event.clientY,
                    item,
                  });
                }}
              >
                <button
                  type="button"
                  className={`workspace-switcher__option${
                    item.id === workspace?.id
                      ? " workspace-switcher__option--active"
                      : ""
                  }`}
                  onClick={() => {
                    setOpen(false);
                    if (item.id !== workspace?.id) {
                      void switchWorkspace(item.id);
                    }
                  }}
                >
                  {item.name}
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="workspace-switcher__create"
            onClick={() => void handleCreateWorkspace()}
            disabled={!runtimeId}
            title={!runtimeId ? "Add an environment in Settings" : undefined}
          >
            <IconPlus size={14} />
            <span>New workspace</span>
          </button>
        </div>
      )}

      {workspaceMenu && (
        <ContextMenu
          x={workspaceMenu.x}
          y={workspaceMenu.y}
          items={[
            {
              id: "rename",
              label: "Rename",
              onClick: () => void handleRenameWorkspace(workspaceMenu.item),
            },
            {
              id: "delete",
              label: "Delete",
              danger: true,
              onClick: () => void handleDeleteWorkspace(workspaceMenu.item),
            },
          ]}
          onClose={() => setWorkspaceMenu(null)}
        />
      )}
    </div>
  );
}
