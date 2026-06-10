import { useDialogStore } from "../../stores/dialogStore";

export async function requireProjectName(
  label = "Project name",
  initialValue = "",
): Promise<string | null> {
  let currentLabel = label;
  let currentInitial = initialValue;

  while (true) {
    const raw = await useDialogStore
      .getState()
      .askPrompt(currentLabel, { initialValue: currentInitial });
    if (!raw) {
      return null;
    }
    const trimmed = raw.trim();
    if (trimmed) {
      return trimmed;
    }
    currentLabel = "Project name cannot be empty.";
    currentInitial = "";
  }
}
