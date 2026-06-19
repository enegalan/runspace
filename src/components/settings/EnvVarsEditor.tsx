import { Button } from "../ui/Button";
import { IconPlus, IconTrash } from "../ui/icons";

interface EnvVarRow {
  key: string;
  value: string;
}

interface EnvVarsEditorProps {
  rows: EnvVarRow[];
  onChange: (rows: EnvVarRow[]) => void;
  disabled?: boolean;
}

export function EnvVarsEditor({ rows, onChange, disabled = false }: EnvVarsEditorProps) {
  const updateRow = (index: number, field: "key" | "value", value: string) => {
    const next = rows.map((row, i) => (i === index ? { ...row, [field]: value } : row));
    onChange(next);
  };

  const removeRow = (index: number) => {
    onChange(rows.filter((_, i) => i !== index));
  };

  const addRow = () => {
    onChange([...rows, { key: "", value: "" }]);
  };

  return (
    <div className="env-vars-editor" data-testid="env-vars-editor">
      <div className="env-vars-editor__header">Environment variables</div>
      {rows.length > 0 && (
        <table className="env-vars-editor__table">
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    className="env-vars-editor__input"
                    value={row.key}
                    onChange={(e) => updateRow(index, "key", e.target.value)}
                    placeholder="KEY"
                    disabled={disabled}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="env-vars-editor__input"
                    value={row.value}
                    onChange={(e) => updateRow(index, "value", e.target.value)}
                    placeholder="value"
                    disabled={disabled}
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="env-vars-editor__remove"
                    onClick={() => removeRow(index)}
                    disabled={disabled}
                    aria-label="Remove variable"
                  >
                    <IconTrash size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="env-vars-editor__add"
        onClick={addRow}
        disabled={disabled}
      >
        <IconPlus size={14} />
        Add variable
      </Button>
    </div>
  );
}

export function envVarsToRows(envVars: Record<string, string>): EnvVarRow[] {
  return Object.entries(envVars).map(([key, value]) => ({ key, value }));
}

export function rowsToEnvVars(rows: EnvVarRow[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const row of rows) {
    const key = row.key.trim();
    if (key) {
      result[key] = row.value;
    }
  }
  return result;
}

export function validateEnvVarRows(rows: EnvVarRow[]): string | null {
  const seen = new Set<string>();
  for (const row of rows) {
    const key = row.key.trim();
    if (! key) {
      return "Environment variable keys cannot be empty";
    }
    if (seen.has(key)) {
      return `Duplicate environment variable key: ${key}`;
    }
    seen.add(key);
  }
  return null;
}
