import { useEffect, useRef, useState } from "react";
import { requireProjectName } from "../../core/workspace/promptProjectName";
import type { WorkspaceInfo } from "../../core/types/workspace";
import { useDialogStore } from "../../stores/dialogStore";
import { useEnvironmentStore } from "../../stores/environmentStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { ContextMenu } from "../ui/ContextMenu";

interface ProjectMenuState {
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
  const createProject = useWorkspaceStore((state) => state.createProject);
  const renameProject = useWorkspaceStore((state) => state.renameProject);
  const deleteProject = useWorkspaceStore((state) => state.deleteProject);
  const loadWorkspaces = useWorkspaceStore((state) => state.loadWorkspaces);
  const askConfirm = useDialogStore((state) => state.askConfirm);

  const [open, setOpen] = useState(false);
  const [projectMenu, setProjectMenu] = useState<ProjectMenuState | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

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

  const handleCreateProject = async () => {
    if (!runtimeId) {
      console.error("Cannot create project: no runtime selected");
      return;
    }

    try {
      const projectName = await requireProjectName("Name for the new project");
      if (!projectName) {
        return;
      }
      setOpen(false);
      await createProject(runtimeId, projectName);
    } catch (error) {
      console.error("Failed to create project:", error);
      const message =
        error instanceof Error ? error.message : "Failed to create project";
      await askConfirm(message, { confirmLabel: "OK" });
    }
  };

  const handleRenameProject = async (item: WorkspaceInfo) => {
    const name = await requireProjectName("Rename project", item.name);
    if (!name || name === item.name) {
      return;
    }
    await renameProject(item.id, name);
  };

  const handleDeleteProject = async (item: WorkspaceInfo) => {
    const confirmed = await askConfirm(`Delete project "${item.name}"?`, {
      confirmLabel: "Delete",
      danger: true,
    });
    if (!confirmed) {
      return;
    }
    setOpen(false);
    await deleteProject(item.id);
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
        title={workspace?.name ?? "Project"}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="workspace-switcher__label">
          {workspace?.name ?? "Project"}
        </span>
        <span className="workspace-switcher__chevron" aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <div className="workspace-switcher__menu" role="listbox">
          <div className="workspace-switcher__heading">Projects</div>
          <ul className="workspace-switcher__list">
            {workspaces.map((item) => (
              <li
                key={item.id}
                className="workspace-switcher__item"
                role="option"
                aria-selected={item.id === workspace?.id}
                onContextMenu={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setProjectMenu({
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
            onClick={() => void handleCreateProject()}
          >
            + New project
          </button>
        </div>
      )}

      {projectMenu && (
        <ContextMenu
          x={projectMenu.x}
          y={projectMenu.y}
          items={[
            {
              id: "rename",
              label: "Rename",
              onClick: () => void handleRenameProject(projectMenu.item),
            },
            {
              id: "delete",
              label: "Delete",
              danger: true,
              onClick: () => void handleDeleteProject(projectMenu.item),
            },
          ]}
          onClose={() => setProjectMenu(null)}
        />
      )}
    </div>
  );
}
