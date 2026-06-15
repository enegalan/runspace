import { getRuntimePresentation } from "../../core/constants/runtimePresentation";
import { useEnvironmentStore } from "../../stores/environmentStore";
import { Badge } from "../ui/Badge";
import { IconChevronRight } from "../ui/icons";

interface EnvironmentIndicatorProps {
  onOpenPicker: () => void;
}

export function EnvironmentIndicator({ onOpenPicker }: EnvironmentIndicatorProps) {
  const selectedId = useEnvironmentStore((state) => state.selectedId);
  const environments = useEnvironmentStore((state) => state.environments);

  const environment = selectedId
    ? environments.find((env) => env.definition.id === selectedId)
    : undefined;
  const presentation = getRuntimePresentation(selectedId ?? "nodejs");
  const name = environment?.definition.name ?? "No environment";
  const category = environment?.definition.category === "framework" ? "Framework" : "Language";

  return (
    <button
      type="button"
      className="env-indicator"
      data-testid="environment-indicator"
      style={{ "--env-accent": presentation.accent } as React.CSSProperties}
      onClick={onOpenPicker}
      title="Change environment"
    >
      <div className="env-indicator__copy">
        <span className="env-indicator__label">Environment</span>
        <span className="env-indicator__name">{name}</span>
      </div>
      {environment && (
        <Badge variant={environment.configured ? "success" : "default"}>
          {environment.configured ? category : "Not configured"}
        </Badge>
      )}
      <IconChevronRight size={14} className="env-indicator__chevron" />
    </button>
  );
}
