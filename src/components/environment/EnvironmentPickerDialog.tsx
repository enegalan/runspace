import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { matchesEnvironmentSearch } from "../../core/environment/search";
import type { Environment, EnvironmentCategory } from "../../core/types/environment";
import { useEnvironmentStore } from "../../stores/environmentStore";
import { useSettingsUiStore } from "../../stores/settingsUiStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";
import { Button } from "../ui/Button";
import { IconClose } from "../ui/icons";

interface EnvironmentPickerDialogProps {
  open: boolean;
  onClose: () => void;
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

export function EnvironmentPickerDialog({ open, onClose }: EnvironmentPickerDialogProps) {
  const environments = useEnvironmentStore((state) => state.environments);
  const selectedId = useEnvironmentStore((state) => state.selectedId);
  const openSettings = useSettingsUiStore((state) => state.openSettings);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  const filteredEnvironments = environments.filter((env) =>
    matchesEnvironmentSearch(env.definition.name, CATEGORY_LABELS[env.definition.category], search),
  );
  const groups = groupByCategory(filteredEnvironments);
  const hasVisibleEnvironments = filteredEnvironments.length > 0;

  const handleSelect = (id: string) => {
    if (id === selectedId) {
      onClose();
      return;
    }

    void (async () => {
      const switched = await useWorkspaceStore.getState().switchEnvironment(id);
      if (!switched) {
        return;
      }
      onClose();
    })();
  };

  const handleOpenEnvironmentsSettings = () => {
    onClose();
    openSettings("environments");
  };

  return createPortal(
    <div
      className="app-dialog"
      data-testid="environment-picker-dialog"
      role="dialog"
      aria-label="Choose environment"
    >
      <div className="app-dialog__backdrop" onClick={onClose} />
      <div className="app-dialog__panel app-dialog__panel--wide env-picker">
        <header className="env-picker__header">
          <h2 className="app-dialog__title">Environment</h2>
          <Button variant="ghost" onClick={onClose} aria-label="Close">
            <IconClose size={16} />
          </Button>
        </header>
        <div className="environment-search">
          <input
            type="search"
            className="environment-search__input"
            placeholder="Search environments..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            autoFocus
            data-testid="environment-picker-search"
          />
        </div>
        {environments.length === 0 ? (
          <p className="env-picker__empty">
            No environments installed. Add runtimes in Settings → Environments.
          </p>
        ) : !hasVisibleEnvironments ? (
          <p className="env-picker__empty" data-testid="environment-picker-no-results">
            No environments match your search.
          </p>
        ) : (
          <div className="env-picker__groups" data-testid="environment-select">
            {(Object.keys(groups) as EnvironmentCategory[]).map((category) => {
              const items = groups[category];
              if (items.length === 0) {
                return null;
              }
              return (
                <section key={category} className="env-picker__group">
                  <h3 className="env-picker__group-label">{CATEGORY_LABELS[category]}</h3>
                  <ul
                    className="env-picker__list"
                    role="listbox"
                    aria-label={CATEGORY_LABELS[category]}
                  >
                    {items.map((env) => (
                      <li key={env.definition.id} role="presentation">
                        <button
                          type="button"
                          className={`env-picker__option${
                            env.definition.id === selectedId ? " env-picker__option--selected" : ""
                          }`}
                          role="option"
                          aria-selected={env.definition.id === selectedId}
                          onClick={() => handleSelect(env.definition.id)}
                        >
                          <span className="env-picker__option-name">{env.definition.name}</span>
                          <span
                            className={`env-picker__badge${
                              env.configured
                                ? " env-picker__badge--configured"
                                : " env-picker__badge--unconfigured"
                            }`}
                          >
                            {env.configured ? "Configured" : "Not configured"}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        )}
        <div className="env-picker__actions">
          <button
            type="button"
            className="env-picker__settings-link"
            onClick={handleOpenEnvironmentsSettings}
            data-testid="environment-picker-settings-link"
          >
            Configure environments
          </button>
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
