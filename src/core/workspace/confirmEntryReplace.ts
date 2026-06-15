import { useDialogStore } from "../../stores/dialogStore";

export async function confirmEntryReplace(name: string): Promise<boolean> {
  return useDialogStore.getState().askConfirm(
    `A file or folder named "${name}" already exists in the destination folder. Do you want to replace it?`,
    { confirmLabel: "Replace", danger: true },
  );
}
