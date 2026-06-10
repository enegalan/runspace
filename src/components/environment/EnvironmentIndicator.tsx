import { getCatalogDefinition } from "../../core/constants/environmentCatalog";
import { getRuntimePresentation } from "../../core/constants/runtimePresentation";
import { useEnvironmentStore } from "../../stores/environmentStore";

export function EnvironmentIndicator() {
  const selectedId = useEnvironmentStore((state) => state.selectedId);
  const environments = useEnvironmentStore((state) => state.environments);

  const environment = environments.find((env) => env.definition.id === selectedId);
  const definition = getCatalogDefinition(selectedId);
  const presentation = getRuntimePresentation(selectedId);
  const name = definition?.name ?? presentation.label;
  const category = definition?.category === "framework" ? "Framework" : "Language";

  return (
    <div
      className="env-indicator"
      data-testid="environment-indicator"
      style={{ "--env-accent": presentation.accent } as React.CSSProperties}
    >
      <div className="env-indicator__copy">
        <span className="env-indicator__label">Environment</span>
        <span className="env-indicator__name">{name}</span>
      </div>
      {environment && (
        <span
          className={`env-indicator__status${
            environment.configured
              ? " env-indicator__status--configured"
              : " env-indicator__status--unconfigured"
          }`}
        >
          {environment.configured ? category : "Not configured"}
        </span>
      )}
    </div>
  );
}
