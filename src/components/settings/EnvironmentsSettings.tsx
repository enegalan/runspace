import { openUrl } from "@tauri-apps/plugin-opener";
import { useState } from "react";
import { matchesEnvironmentSearch } from "../../core/environment/search";
import { pickNativePath } from "../../core/api/pickNativePath";
import { runspaceInvoke } from "../../core/api/runspaceInvoke";
import type {
  ConfigFieldType,
  Environment,
  EnvironmentCategory,
  EnvironmentDefinition,
  EnvironmentId,
  ValidationResult,
} from "../../core/types/environment";
import { useEnvironmentStore } from "../../stores/environmentStore";
import { IconCheck, IconChevronDown, IconChevronRight } from "../ui/icons";
import { EnvVarsEditor, envVarsToRows, rowsToEnvVars, validateEnvVarRows } from "./EnvVarsEditor";
import { SettingsPageHeader } from "./SettingsUi";

const CATEGORY_LABELS: Record<EnvironmentCategory, string> = {
  language: "Language",
  framework: "Framework",
};

interface EnvironmentCardProps {
  environment: Environment;
}

function EnvironmentCard({ environment }: EnvironmentCardProps) {
  const refresh = useEnvironmentStore((state) => state.refresh);
  const uninstall = useEnvironmentStore((state) => state.uninstall);
  const [expanded, setExpanded] = useState(false);
  const [paths, setPaths] = useState<Record<string, string>>(environment.user_config.paths);
  const [envRows, setEnvRows] = useState(() => envVarsToRows(environment.user_config.env_vars));
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<ValidationResult | null>(null);

  const { definition, configured, version } = environment;

  const browsePath = async (fieldType: ConfigFieldType, key: string) => {
    try {
      const selected = await pickNativePath(fieldType === "directory_path");
      if (selected) {
        setPaths((prev) => ({ ...prev, [key]: selected }));
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : String(err));
    }
  };

  const handleSave = async () => {
    const envError = validateEnvVarRows(envRows);
    if (envError) {
      setMessage(envError);
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      await runspaceInvoke("set_environment_paths", {
        environmentId: definition.id,
        paths,
      });
      await runspaceInvoke("set_environment_env_vars", {
        environmentId: definition.id,
        envVars: rowsToEnvVars(envRows),
      });
      await refresh();
      setMessage("Saved");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setMessage(null);
    setTestResult(null);
    try {
      const result = await runspaceInvoke<ValidationResult>("validate_environment", {
        environmentId: definition.id,
      });
      setTestResult(result);
      await refresh();
      if (result.valid && result.version) {
        setMessage(`Version: ${result.version}`);
      } else if (result.errors.length > 0) {
        setMessage(result.errors.join("; "));
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setTesting(false);
    }
  };

  const handleUninstall = async () => {
    setRemoving(true);
    setMessage(null);
    try {
      await uninstall(definition.id as EnvironmentId);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setRemoving(false);
    }
  };

  const displayVersion = testResult?.version ?? version;

  return (
    <div
      className={`env-card${expanded ? " env-card--expanded" : ""}`}
      data-testid={`env-card-${definition.id}`}
    >
      <button
        type="button"
        className="env-card__header"
        onClick={() => setExpanded((prev) => ! prev)}
        aria-expanded={expanded}
      >
        <span className="env-card__chevron" aria-hidden="true">
          {expanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
        </span>
        <span className="env-card__name">{definition.name}</span>
        <span className={`env-card__status${configured ? " env-card__status--configured" : ""}`}>
          {configured ? (
            <>
              <IconCheck size={12} />
              Configured
            </>
          ) : (
            "Not configured"
          )}
        </span>
      </button>

      {expanded && (
        <div className="env-card__body">
          {definition.config_fields.map((field) => (
            <div key={field.key} className="env-card__field">
              <label className="env-card__label" htmlFor={`${definition.id}-${field.key}`}>
                {field.label}
              </label>
              <div className="env-card__path-row">
                <input
                  id={`${definition.id}-${field.key}`}
                  type="text"
                  className="env-card__input"
                  value={paths[field.key] ?? ""}
                  onChange={(e) => setPaths((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={
                    field.field_type === "directory_path" ? "/path/to/project" : "/path/to/binary"
                  }
                />
                <button
                  type="button"
                  className="btn"
                  onClick={() => void browsePath(field.field_type, field.key)}
                >
                  Browse
                </button>
              </div>
            </div>
          ))}

          {displayVersion && (
            <div className="env-card__version">
              Version: {displayVersion}
              {testResult?.version ? " (last tested)" : ""}
            </div>
          )}

          <EnvVarsEditor rows={envRows} onChange={setEnvRows} disabled={saving || testing} />

          <div className="env-card__actions">
            <a
              href={definition.install_guide_url}
              className="env-card__guide-link"
              onClick={(e) => {
                e.preventDefault();
                void openUrl(definition.install_guide_url);
              }}
            >
              Install guide
            </a>
            <div className="env-card__action-buttons">
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => void handleUninstall()}
                disabled={removing || saving || testing}
              >
                {removing ? "Removing..." : "Remove"}
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => void handleTest()}
                disabled={testing || saving || removing}
              >
                {testing ? "Testing..." : "Test"}
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => void handleSave()}
                disabled={saving || testing || removing}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {message && (
            <div
              className={`env-card__message${testResult && ! testResult.valid ? " env-card__message--error" : ""}`}
            >
              {message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface AvailableEnvironmentRowProps {
  definition: EnvironmentDefinition;
}

function AvailableEnvironmentRow({ definition }: AvailableEnvironmentRowProps) {
  const install = useEnvironmentStore((state) => state.install);
  const [installing, setInstalling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInstall = async () => {
    setInstalling(true);
    setError(null);
    try {
      await install(definition.id as EnvironmentId);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setInstalling(false);
    }
  };

  return (
    <div className="env-available-row" data-testid={`env-available-${definition.id}`}>
      <div className="env-available-row__info">
        <span className="env-available-row__name">{definition.name}</span>
        <span className="env-available-row__category">{CATEGORY_LABELS[definition.category]}</span>
      </div>
      <div className="env-available-row__actions">
        <a
          href={definition.install_guide_url}
          className="env-card__guide-link"
          onClick={(e) => {
            e.preventDefault();
            void openUrl(definition.install_guide_url);
          }}
        >
          Guide
        </a>
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => void handleInstall()}
          disabled={installing}
        >
          {installing ? "Adding..." : "Add"}
        </button>
      </div>
      {error && <div className="env-card__message env-card__message--error">{error}</div>}
    </div>
  );
}

export function EnvironmentsSettings() {
  const environments = useEnvironmentStore((state) => state.environments);
  const available = useEnvironmentStore((state) => state.available);
  const [search, setSearch] = useState("");

  const filteredEnvironments = environments.filter((env) =>
    matchesEnvironmentSearch(env.definition.name, CATEGORY_LABELS[env.definition.category], search),
  );
  const filteredAvailable = available.filter((definition) =>
    matchesEnvironmentSearch(definition.name, CATEGORY_LABELS[definition.category], search),
  );
  const showAvailableSection = available.length > 0;
  const hasSearch = search.trim().length > 0;
  const hasVisibleResults = filteredEnvironments.length > 0 || filteredAvailable.length > 0;

  return (
    <div className="settings-page environments-settings" data-testid="environments-settings">
      <SettingsPageHeader
        title="Environments"
        description="Configure binary paths and environment variables. Paths are auto-detected on startup when possible."
      />

      <div className="environment-search environments-settings__search">
        <input
          type="search"
          className="environment-search__input"
          placeholder="Search environments..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          data-testid="environments-settings-search"
        />
      </div>

      {hasSearch && ! hasVisibleResults ? (
        <p className="environments-settings__empty" data-testid="environments-no-results">
          No environments match your search.
        </p>
      ) : (
        <>
          <section className="settings-card environments-settings__section">
            <div className="settings-card__header">
              <h3 className="settings-card__title">Installed</h3>
            </div>
            <div className="settings-card__body">
              {environments.length === 0 ? (
                <p className="environments-settings__empty" data-testid="environments-empty">
                  No environments installed. Add one from the list below.
                </p>
              ) : filteredEnvironments.length === 0 ? (
                <p className="environments-settings__empty">
                  No installed environments match your search.
                </p>
              ) : (
                <div className="environments-settings__list">
                  {filteredEnvironments.map((env) => (
                    <EnvironmentCard key={env.definition.id} environment={env} />
                  ))}
                </div>
              )}
            </div>
          </section>

          {showAvailableSection && (
            <section className="settings-card environments-settings__section">
              <div className="settings-card__header">
                <h3 className="settings-card__title">Available</h3>
                <p className="settings-card__description">
                  Add runtimes and frameworks to the toolbar selector.
                </p>
              </div>
              <div className="settings-card__body">
                {filteredAvailable.length === 0 ? (
                  <p className="environments-settings__empty">
                    No available environments match your search.
                  </p>
                ) : (
                  <div className="environments-settings__available">
                    {filteredAvailable.map((definition) => (
                      <AvailableEnvironmentRow key={definition.id} definition={definition} />
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
