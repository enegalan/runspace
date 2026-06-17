import { useDialogStore } from "../../stores/dialogStore";

export async function requireWorkspaceName(
  label = "Workspace name",
  initialValue = "",
): Promise<string | null> {
  const currentLabel = label;
  const currentInitial = initialValue;

  while (true) {
    const raw = await useDialogStore
      .getState()
      .askPrompt(currentLabel, {
        initialValue: currentInitial,
        validate: (value) => (value.trim() ? null : "Workspace name cannot be empty."),
      });
    if (raw === null) {
      return null;
    }
    return raw.trim();
  }
}
