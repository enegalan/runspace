import { useEffect, useRef, useState } from "react";
import type { Environment, EnvironmentCategory, EnvironmentId } from "../../core/types/environment";
import { getRuntimePresentation } from "../../core/constants/runtimePresentation";
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

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const selected =
    environments.find((env) => env.definition.id === selectedId) ?? environments[0];
  const presentation = getRuntimePresentation(selectedId ?? "nodejs");
  const selectorDisabled = disabled || environments.length === 0;
  const groups = groupByCategory(environments);

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

    await select(id as EnvironmentId);
    return true;
  };

  const handleSelect = (id: string) => {
    if (id === selectedId) {
      setOpen(false);
      return;
    }

    void applyEnvironmentSwitch(id);
    setOpen(false);
  };

  return (
    <div
      ref={rootRef}
      className={`env-select${open ? " env-select--open" : ""}${selectorDisabled ? " env-select--disabled" : ""}`}
      data-testid="environment-select"
      style={{ "--env-accent": presentation.accent } as React.CSSProperties}
    >
      <button
        type="button"
        className="env-select__trigger"
        onClick={() => !selectorDisabled && setOpen((prev) => !prev)}
        disabled={selectorDisabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Environment: ${selected?.definition.name ?? "No environment"}`}
        title={selectorDisabled && !disabled ? "Add an environment in Settings" : undefined}
      >
        <span className="env-select__value">
          {selected?.definition.name ?? "No environment"}
        </span>
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
  );
}
