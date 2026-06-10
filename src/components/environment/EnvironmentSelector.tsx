import { useEffect, useRef, useState } from "react";
import {
  environmentEditorState,
  shouldConfirmEnvironmentSwitch,
} from "../../core/environment/switchEnvironment";
import type { Environment, EnvironmentCategory } from "../../core/types/environment";
import { getCatalogDefinition } from "../../core/constants/environmentCatalog";
import { getRuntimePresentation } from "../../core/constants/runtimePresentation";
import { RuntimeChangeDialog } from "../runtime/RuntimeChangeDialog";
import { useEditorStore } from "../../stores/editorStore";
import { useEditorTabsStore } from "../../stores/editorTabsStore";
import { useEnvironmentStore } from "../../stores/environmentStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";

interface EnvironmentSelectorProps {
  disabled?: boolean;
}

const CATEGORY_LABELS: Record<EnvironmentCategory, string> = {
  language: "Languages",
  framework: "Frameworks",
};

function groupByCategory(environments: Environment[]) {
  const groups: Record<EnvironmentCategory, Environment[]> = {
    language: [],
    framework: [],
  };
  for (const env of environments) {
    groups[env.definition.category].push(env);
  }
  return groups;
}

export function EnvironmentSelector({ disabled = false }: EnvironmentSelectorProps) {
  const environments = useEnvironmentStore((state) => state.environments);
  const selectedId = useEnvironmentStore((state) => state.selectedId);
  const select = useEnvironmentStore((state) => state.select);
  const code = useEditorStore((state) => state.code);
  const setCode = useEditorStore((state) => state.setCode);
  const setLanguage = useEditorStore((state) => state.setLanguage);
  const hasDirtyFiles = useEditorTabsStore((state) => state.hasDirtyFiles);

  const [open, setOpen] = useState(false);
  const [pendingEnvironmentId, setPendingEnvironmentId] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected =
    environments.find((env) => env.definition.id === selectedId) ?? environments[0];
  const presentation = getRuntimePresentation(selectedId);
  const groups = groupByCategory(environments);
  const pendingDefinition = pendingEnvironmentId
    ? getCatalogDefinition(pendingEnvironmentId)
    : undefined;

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

  const applyEnvironmentSwitch = async (id: string): Promise<boolean> => {
    const switched = await useWorkspaceStore.getState().switchEnvironment(id);
    if (!switched) {
      return false;
    }

    await select(id as typeof selectedId);
    const nextEditor = environmentEditorState(id);
    setLanguage(nextEditor.language);
    setCode(nextEditor.code);
    return true;
  };

  const handleSelect = (id: string) => {
    if (id === selectedId) {
      setOpen(false);
      return;
    }

    if (hasDirtyFiles() || shouldConfirmEnvironmentSwitch(code, selectedId)) {
      setPendingEnvironmentId(id);
      setOpen(false);
      return;
    }

    void applyEnvironmentSwitch(id);
    setOpen(false);
  };

  const handleConfirmSwitch = () => {
    if (!pendingEnvironmentId) {
      return;
    }
    void applyEnvironmentSwitch(pendingEnvironmentId);
    setPendingEnvironmentId(null);
  };

  const handleCancelSwitch = () => {
    setPendingEnvironmentId(null);
  };

  return (
    <>
      <div
        ref={rootRef}
        className={`env-select${open ? " env-select--open" : ""}${disabled ? " env-select--disabled" : ""}`}
        data-testid="environment-select"
        style={{ "--env-accent": presentation.accent } as React.CSSProperties}
      >
        <button
          type="button"
          className="env-select__trigger"
          onClick={() => !disabled && setOpen((prev) => !prev)}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`Environment: ${selected?.definition.name ?? "Environment"}`}
        >
          <span className="env-select__value">{selected?.definition.name ?? "Environment"}</span>
          {selected && (
            <span
              className={`env-select__badge${selected.configured ? " env-select__badge--configured" : " env-select__badge--unconfigured"}`}
            >
              {selected.configured ? "Configured" : "Not configured"}
            </span>
          )}
          <span className="env-select__chevron" aria-hidden="true">
            ▾
          </span>
        </button>

        {open && (
          <div className="env-select__menu" role="listbox" aria-label="Environment">
            {(Object.keys(groups) as EnvironmentCategory[]).map((category) => {
              const items = groups[category];
              if (items.length === 0) {
                return null;
              }
              return (
                <div key={category} className="env-select__group">
                  <div className="env-select__group-label">{CATEGORY_LABELS[category]}</div>
                  <ul className="env-select__list">
                    {items.map((env) => (
                      <li
                        key={env.definition.id}
                        role="option"
                        aria-selected={env.definition.id === selectedId}
                      >
                        <button
                          type="button"
                          className={`env-select__option${env.definition.id === selectedId ? " env-select__option--selected" : ""}`}
                          onClick={() => handleSelect(env.definition.id)}
                        >
                          <span className="env-select__option-name">{env.definition.name}</span>
                          <span
                            className={`env-select__badge${env.configured ? " env-select__badge--configured" : " env-select__badge--unconfigured"}`}
                          >
                            {env.configured ? "Configured" : "Not configured"}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <RuntimeChangeDialog
        open={pendingEnvironmentId !== null}
        environmentName={pendingDefinition?.name ?? "environment"}
        onCancel={handleCancelSwitch}
        onConfirm={handleConfirmSwitch}
      />
    </>
  );
}
