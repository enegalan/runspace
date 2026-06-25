import { getCurrentWindow } from "@tauri-apps/api/window";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import { useEffect, useRef, useState } from "react";
import { waitForBackendReady } from "../core/api/fetchBackend";
import { runspaceInvoke } from "../core/api/runspaceInvoke";
import { syncOnboardingFromSession } from "../core/onboarding/onboardingState";
import { pickImportedFileToOpen } from "../core/workspace/externalFileDrop";
import {
  clearNativeDropHover,
  resolveDropTargetFromPoint,
  updateNativeDropHover,
} from "../core/workspace/fileTreeDropTarget";
import { isTauri } from "../core/platform/isTauri";
import type { SessionData } from "../core/types/workspace";
import type { EnvironmentId } from "../core/types/environment";
import { useEditorTabsStore } from "../stores/editorTabsStore";
import { useEnvironmentStore } from "../stores/environmentStore";
import { useWorkspaceStore } from "../stores/workspaceStore";

/**
 * This hook is used to bootstrap the app.
 * It is used to load the backend, the environments, the workspaces, and the editor tabs.
 * It is also used to flush the session state when the app is hidden.
 * It is also used to destroy the app when the window is closed.
 */
export function useAppBootstrap() {
  const bootstrapStarted = useRef(false);
  const [backendReady, setBackendReady] = useState(isTauri() && !import.meta.env.DEV);

  const workspaceLoaded = useWorkspaceStore((state) => state.loaded);
  const envLoaded = useEnvironmentStore((state) => state.loaded);
  const tabsLoaded = useEditorTabsStore((state) => state.loaded);
  const loadEnvironments = useEnvironmentStore((state) => state.load);
  const selectEnvironment = useEnvironmentStore((state) => state.select);

  const appReady = backendReady && workspaceLoaded && envLoaded && tabsLoaded;

  useEffect(() => {
    let cancelled = false;

    void waitForBackendReady()
      .then(() => {
        if (!cancelled) {
          setBackendReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setBackendReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!backendReady || bootstrapStarted.current) {
      return;
    }
    bootstrapStarted.current = true;

    let cancelled = false;

    const bootstrap = async () => {
      try {
        await loadEnvironments();
        if (cancelled) {
          return;
        }

        const session = await runspaceInvoke<SessionData>("read_session");
        const onboardingComplete = syncOnboardingFromSession(session);
        useWorkspaceStore.setState({
          onboardingComplete,
          onboardingRequired: onboardingComplete
            ? false
            : useWorkspaceStore.getState().onboardingRequired,
        });
        const storedRuntimeId = session.last_runtime_id;
        const { selectedId, environments } = useEnvironmentStore.getState();
        const runtimeId =
          storedRuntimeId && environments.some((env) => env.definition.id === storedRuntimeId)
            ? (storedRuntimeId as EnvironmentId)
            : selectedId;

        if (runtimeId && storedRuntimeId === runtimeId && storedRuntimeId !== selectedId) {
          await selectEnvironment(runtimeId);
        }

        await useWorkspaceStore.getState().initialize(runtimeId);
      } catch (error) {
        console.error("App bootstrap failed:", error);
        try {
          const runtimeId = useEnvironmentStore.getState().selectedId;
          await useWorkspaceStore.getState().recoverFromFailure(runtimeId);
        } catch (recoveryError) {
          console.error("Workspace recovery failed:", recoveryError);
          useWorkspaceStore.setState({ loaded: true });
        }
        useEnvironmentStore.setState({ loaded: true });
      } finally {
        if (!cancelled) {
          useEditorTabsStore.setState({ loaded: true });
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [backendReady, loadEnvironments, selectEnvironment]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        void flushSessionState();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  useEffect(() => {
    if (!isTauri()) {
      return;
    }

    let unlisten: (() => void) | undefined;
    let cancelled = false;

    void (async () => {
      const [webview, appWindow] = await Promise.all([getCurrentWebview(), getCurrentWindow()]);
      const scaleFactor = await appWindow.scaleFactor();
      if (cancelled) {
        return;
      }

      const unlistenDragDrop = await webview.onDragDropEvent((event) => {
        const { type } = event.payload;

        if (type === "leave") {
          clearNativeDropHover();
          return;
        }

        if (!useWorkspaceStore.getState().workspace) {
          return;
        }

        if (type === "over") {
          const { x, y } = event.payload.position.toLogical(scaleFactor);
          updateNativeDropHover(x, y);
          return;
        }

        if (type !== "drop" || event.payload.paths.length === 0) {
          return;
        }

        const { x, y } = event.payload.position.toLogical(scaleFactor);
        const targetDir = resolveDropTargetFromPoint(x, y) ?? "";
        clearNativeDropHover();

        void useWorkspaceStore
          .getState()
          .importExternalFiles(event.payload.paths, targetDir)
          .then((imported) => {
            const fileToOpen = pickImportedFileToOpen(imported);
            if (fileToOpen) {
              return useEditorTabsStore.getState().openFile(fileToOpen);
            }
          })
          .catch((error) => {
            console.error("Failed to import dropped files:", error);
          });
      });
      if (cancelled) {
        unlistenDragDrop();
        return;
      }
      unlisten = unlistenDragDrop;
    })();

    return () => {
      cancelled = true;
      unlisten?.();
    };
  }, []);

  useEffect(() => {
    if (!isTauri()) {
      return;
    }

    let unlisten: (() => void) | undefined;

    void getCurrentWindow()
      .onCloseRequested((event) => {
        event.preventDefault();
        void flushSessionState().finally(() => {
          void getCurrentWindow().destroy();
        });
      })
      .then((fn) => {
        unlisten = fn;
      });

    return () => {
      unlisten?.();
    };
  }, []);

  return { appReady };
}

/**
 * This function is used to flush the session state when the app is hidden.
 * It is used to save the active file and persist the session state.
 */
async function flushSessionState(): Promise<void> {
  const workspace = useWorkspaceStore.getState().workspace;
  if (!workspace) {
    return;
  }

  await useEditorTabsStore.getState().saveActiveFile();
  await useEditorTabsStore.getState().persistForEnvironment(workspace.runtime_id, workspace.id);
}
