import { openUrl } from "@tauri-apps/plugin-opener";
import { useEffect, useMemo, useState } from "react";
import { pickNativePath } from "../../core/api/pickNativePath";
import { runspaceInvoke } from "../../core/api/runspaceInvoke";
import {
  DEFAULT_ENVIRONMENT_ID,
  ENVIRONMENT_CATALOG,
} from "../../core/constants/environmentCatalog";
import type {
  ConfigFieldType,
  EnvironmentCategory,
  EnvironmentId,
} from "../../core/types/environment";
import { Button } from "../ui/Button";
import { useEnvironmentStore } from "../../stores/environmentStore";
import { useWorkspaceStore } from "../../stores/workspaceStore";

const CATEGORY_LABELS: Record<EnvironmentCategory, string> = {
  language: "Languages",
  framework: "Frameworks",
};

const CONCEPTS = [
  {
    title: "Workspaces",
    description:
      "Each workspace is a self-contained area for your code and files.",
  },
  {
    title: "Environments",
    description:
      "Connect the language runtimes installed on your machine: Node.js, PHP, Python, Ruby, and more.",
  },
  {
    title: "Run",
    description:
      "Press Run and see what happens — results, errors, and whether your code succeeded.",
  },
];

type WelcomeStep = "intro" | "concepts" | "setup";

export function WelcomeScreen() {
  const environments = useEnvironmentStore((state) => state.environments);
  const available = useEnvironmentStore((state) => state.available);
  const install = useEnvironmentStore((state) => state.install);
  const select = useEnvironmentStore((state) => state.select);
  const refresh = useEnvironmentStore((state) => state.refresh);
  const finishOnboarding = useWorkspaceStore((state) => state.finishOnboarding);

  const [step, setStep] = useState<WelcomeStep>("intro");
  const [workspaceName, setWorkspaceName] = useState("");
  const [primaryRuntimeId, setPrimaryRuntimeId] =
    useState<EnvironmentId>(DEFAULT_ENVIRONMENT_ID);
  const [additionalRuntimeIds, setAdditionalRuntimeIds] = useState<Set<EnvironmentId>>(
    () => new Set(),
  );
  const [paths, setPaths] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const installedIds = useMemo(
    () => new Set(environments.map((env) => env.definition.id)),
    [environments],
  );

  const primaryDefinition = ENVIRONMENT_CATALOG.find(
    (definition) => definition.id === primaryRuntimeId,
  );

  const groupedCatalog = useMemo(() => {
    const groups: Record<EnvironmentCategory, typeof ENVIRONMENT_CATALOG> = {
      language: [],
      framework: [],
    };
    for (const definition of ENVIRONMENT_CATALOG) {
      groups[definition.category].push(definition);
    }
    return groups;
  }, []);

  useEffect(() => {
    const installed = environments.find(
      (env) => env.definition.id === primaryRuntimeId,
    );
    if (installed) {
      setPaths(installed.user_config.paths);
      return;
    }
    setPaths({});
  }, [environments, primaryRuntimeId]);

  const toggleAdditionalRuntime = (id: EnvironmentId) => {
    if (id === primaryRuntimeId) {
      return;
    }
    setAdditionalRuntimeIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const browsePath = async (fieldType: ConfigFieldType, key: string) => {
    try {
      const selected = await pickNativePath(fieldType === "directory_path");
      if (selected) {
        setPaths((prev) => ({ ...prev, [key]: selected }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  const handleCreateWorkspace = async () => {
    const trimmedName = workspaceName.trim();
    if (!trimmedName) {
      setError("Enter a workspace name to continue.");
      return;
    }
    if (!primaryDefinition) {
      setError("Select a runtime for your first workspace.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const toInstall = new Set<EnvironmentId>(additionalRuntimeIds);
      if (!installedIds.has(primaryRuntimeId)) {
        toInstall.add(primaryRuntimeId);
      }

      for (const id of toInstall) {
        await install(id);
      }

      await refresh();

      const installedPrimary = useEnvironmentStore
        .getState()
        .environments.find((env) => env.definition.id === primaryRuntimeId);
      const mergedPaths = {
        ...(installedPrimary?.user_config.paths ?? {}),
        ...paths,
      };

      for (const field of primaryDefinition.config_fields) {
        if (!field.required) {
          continue;
        }
        const value = mergedPaths[field.key]?.trim() ?? "";
        if (!value) {
          setError(`Set ${field.label.toLowerCase()} for ${primaryDefinition.name}.`);
          return;
        }
      }

      const storedPaths = installedPrimary?.user_config.paths ?? {};
      const pathsChanged = Object.keys(mergedPaths).some(
        (key) => (mergedPaths[key] ?? "").trim() !== (storedPaths[key] ?? "").trim(),
      );
      if (pathsChanged) {
        await runspaceInvoke("set_environment_paths", {
          environmentId: primaryRuntimeId,
          paths: mergedPaths,
        });
        await refresh();
      }

      await select(primaryRuntimeId);
      await finishOnboarding(primaryRuntimeId, trimmedName);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const stepIndex = step === "intro" ? 0 : step === "concepts" ? 1 : 2;

  return (
    <div className="welcome-screen" data-testid="welcome-screen">
      <div className="welcome-screen__frame">
        <header className="welcome-screen__header">
          <div className="welcome-screen__brand">
            <span className="welcome-screen__brand-name">Runspace</span>
          </div>
          <div className="welcome-screen__progress" aria-label="Onboarding progress">
            {[0, 1, 2].map((index) => (
              <span
                key={index}
                className={`welcome-screen__progress-dot${
                  index <= stepIndex ? " welcome-screen__progress-dot--active" : ""
                }`}
              />
            ))}
          </div>
        </header>

        {step === "intro" && (
          <section className="welcome-screen__panel">
            <h1 className="welcome-screen__title">Welcome to Runspace</h1>
            <p className="welcome-screen__lead">
              Your personal playground for code — multiple languages, one workspace, zero
              setup beyond the runtimes you already have.
            </p>
            <ul className="welcome-screen__highlights">
              <li>Bring your own runtimes: Node.js, PHP, Python, Ruby...</li>
              <li>Isolated execution on every run.</li>
              <li>Editor, files, and output in one flow.</li>
            </ul>
            <div className="welcome-screen__actions">
              <Button
                variant="primary"
                className="welcome-screen__btn"
                onClick={() => setStep("concepts")}
              >
                Get started
              </Button>
            </div>
          </section>
        )}

        {step === "concepts" && (
          <section className="welcome-screen__panel">
            <h1 className="welcome-screen__title">How Runspace works</h1>
            <p className="welcome-screen__lead">
              Three ideas to keep in mind before you create your first workspace.
            </p>
            <div className="welcome-screen__concepts">
              {CONCEPTS.map((concept) => (
                <article key={concept.title} className="welcome-screen__concept">
                  <h2 className="welcome-screen__concept-title">{concept.title}</h2>
                  <p className="welcome-screen__concept-text">{concept.description}</p>
                </article>
              ))}
            </div>
            <div className="welcome-screen__actions">
              <Button className="welcome-screen__btn" onClick={() => setStep("intro")}>
                Back
              </Button>
              <Button
                variant="primary"
                className="welcome-screen__btn"
                onClick={() => setStep("setup")}
              >
                Create my first workspace
              </Button>
            </div>
          </section>
        )}

        {step === "setup" && (
          <section className="welcome-screen__panel welcome-screen__panel--setup">
            <h1 className="welcome-screen__title">Create your first workspace</h1>
            <p className="welcome-screen__lead">
              Runspace needs at least one workspace to open the editor. Name your workspace, pick a primary runtime, and add any other environments you plan to use.
            </p>

            <label className="welcome-screen__field">
              <span className="welcome-screen__field-label">Workspace name</span>
              <input
                className="welcome-screen__input"
                value={workspaceName}
                placeholder="My sandbox"
                autoFocus
                onChange={(event) => setWorkspaceName(event.target.value)}
              />
            </label>

            <div className="welcome-screen__section">
              <h2 className="welcome-screen__section-title">Primary runtime</h2>
              <p className="welcome-screen__section-hint">
                This runtime defines the entry file and template for your new workspace.
              </p>
              <div className="welcome-screen__runtime-groups">
                {(Object.keys(groupedCatalog) as EnvironmentCategory[]).map((category) => {
                  const items = groupedCatalog[category];
                  if (items.length === 0) {
                    return null;
                  }
                  return (
                    <div key={category} className="welcome-screen__runtime-group">
                      <div className="welcome-screen__runtime-group-label">
                        {CATEGORY_LABELS[category]}
                      </div>
                      <div className="welcome-screen__runtime-list">
                        {items.map((definition) => {
                          const isInstalled = installedIds.has(definition.id);
                          const isAvailable = available.some(
                            (item) => item.id === definition.id,
                          );
                          const isSelected = primaryRuntimeId === definition.id;
                          return (
                            <label
                              key={definition.id}
                              className={`welcome-screen__runtime-option${
                                isSelected ? " welcome-screen__runtime-option--selected" : ""
                              }`}
                            >
                              <input
                                type="radio"
                                name="primary-runtime"
                                checked={isSelected}
                                onChange={() =>
                                  setPrimaryRuntimeId(definition.id as EnvironmentId)
                                }
                              />
                              <span className="welcome-screen__runtime-name">
                                {definition.name}
                              </span>
                              <span className="welcome-screen__runtime-badge">
                                {isInstalled
                                  ? "Installed"
                                  : isAvailable
                                    ? "Available"
                                    : "Installed"}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {primaryDefinition && primaryDefinition.config_fields.length > 0 && (
              <div className="welcome-screen__section">
                <h2 className="welcome-screen__section-title">
                  Configure {primaryDefinition.name}
                </h2>
                <p className="welcome-screen__section-hint">
                  Paths are auto-detected when possible. Confirm or browse to the binaries on
                  your system.
                </p>
                <div className="welcome-screen__path-fields">
                  {primaryDefinition.config_fields.map((field) => (
                    <label key={field.key} className="welcome-screen__field">
                      <span className="welcome-screen__field-label">
                        {field.label}
                        {field.required ? "" : " (optional)"}
                      </span>
                      <div className="welcome-screen__path-row">
                        <input
                          className="welcome-screen__input"
                          value={paths[field.key] ?? ""}
                          placeholder={field.required ? "Required" : "Optional"}
                          onChange={(event) =>
                            setPaths((prev) => ({
                              ...prev,
                              [field.key]: event.target.value,
                            }))
                          }
                        />
                        {field.field_type === "file_path" ||
                        field.field_type === "directory_path" ? (
                          <button
                            type="button"
                            className="btn"
                            onClick={() => void browsePath(field.field_type, field.key)}
                          >
                            Browse
                          </button>
                        ) : null}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="welcome-screen__section">
              <h2 className="welcome-screen__section-title">Also add runtimes</h2>
              <p className="welcome-screen__section-hint">
                Optional. Install additional environments now so they are ready to select later.
              </p>
              <div className="welcome-screen__extras">
                {ENVIRONMENT_CATALOG.filter(
                  (definition) => definition.id !== primaryRuntimeId,
                ).map((definition) => {
                  const checked = additionalRuntimeIds.has(
                    definition.id as EnvironmentId,
                  );
                  const isInstalled = installedIds.has(definition.id);
                  return (
                    <label
                      key={definition.id}
                      className={`welcome-screen__extra-option${
                        checked ? " welcome-screen__extra-option--selected" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked || isInstalled}
                        disabled={isInstalled}
                        onChange={() =>
                          toggleAdditionalRuntime(definition.id as EnvironmentId)
                        }
                      />
                      <span>{definition.name}</span>
                      {isInstalled && (
                        <span className="welcome-screen__runtime-badge">Installed</span>
                      )}
                      {!isInstalled && (
                        <a
                          href={definition.install_guide_url}
                          className="welcome-screen__guide-link"
                          onClick={(event) => {
                            event.preventDefault();
                            void openUrl(definition.install_guide_url);
                          }}
                        >
                          Guide
                        </a>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            {error && <p className="welcome-screen__error">{error}</p>}

            <div className="welcome-screen__actions">
              <Button
                className="welcome-screen__btn"
                onClick={() => setStep("concepts")}
                disabled={submitting}
              >
                Back
              </Button>
              <Button
                variant="primary"
                className="welcome-screen__btn"
                onClick={() => void handleCreateWorkspace()}
                disabled={submitting}
              >
                {submitting ? "Creating..." : "Open workspace"}
              </Button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
