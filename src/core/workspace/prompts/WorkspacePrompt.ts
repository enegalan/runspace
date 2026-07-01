import { useDialogStore } from "../../../stores/dialogStore";

export type PromptProcessResult<TResult> =
  { status: "done"; value: TResult } | { status: "retry"; label: string; initialValue: string };

export abstract class WorkspacePrompt<TResult> {
  protected label: string;
  protected initialValue: string;

  protected constructor(label: string, initialValue = "") {
    this.label = label;
    this.initialValue = initialValue;
  }

  protected abstract emptyValueMessage(): string;

  protected placeholder(): string | undefined {
    return undefined;
  }

  protected abstract process(trimmed: string): Promise<PromptProcessResult<TResult>>;

  async run(): Promise<TResult | null> {
    while (true) {
      const raw = await useDialogStore.getState().askPrompt(this.label, {
        initialValue: this.initialValue,
        placeholder: this.placeholder(),
        validate: (value) => (value.trim() ? null : this.emptyValueMessage()),
      });
      if (raw === null) {
        return null;
      }

      const outcome = await this.process(raw.trim());
      if (outcome.status === "done") {
        return outcome.value;
      }

      this.label = outcome.label;
      this.initialValue = outcome.initialValue;
    }
  }
}
