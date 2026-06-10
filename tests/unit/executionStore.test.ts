import { beforeEach, describe, expect, it } from "vitest";
import { useExecutionStore } from "../../src/stores/executionStore";

describe("executionStore", () => {
  beforeEach(() => {
    useExecutionStore.getState().reset();
  });

  it("starts in idle state", () => {
    const state = useExecutionStore.getState();
    expect(state.status).toBe("idle");
    expect(state.stdout).toBe("");
    expect(state.stderr).toBe("");
    expect(state.exitCode).toBeNull();
  });

  it("transitions to running and appends output", () => {
    const store = useExecutionStore.getState();
    store.setRunning();
    expect(useExecutionStore.getState().status).toBe("running");

    store.appendOutput("stdout", "hello");
    store.appendOutput("stderr", "warn");
    expect(useExecutionStore.getState().stdout).toBe("hello");
    expect(useExecutionStore.getState().stderr).toBe("warn");
  });

  it("resolves success on exit code 0", () => {
    const store = useExecutionStore.getState();
    store.setRunning();
    store.setFinished(0, false);

    const state = useExecutionStore.getState();
    expect(state.status).toBe("success");
    expect(state.exitCode).toBe(0);
    expect(state.durationMs).not.toBeNull();
  });

  it("resolves error on non-zero exit code", () => {
    const store = useExecutionStore.getState();
    store.setRunning();
    store.setFinished(1, false);

    expect(useExecutionStore.getState().status).toBe("error");
  });

  it("resolves timeout", () => {
    const store = useExecutionStore.getState();
    store.setRunning();
    store.setFinished(null, true);

    expect(useExecutionStore.getState().status).toBe("timeout");
  });

  it("tracks compile phase while running", () => {
    const store = useExecutionStore.getState();
    store.setRunning();
    store.setPhase("compile");
    expect(useExecutionStore.getState().phase).toBe("compile");

    store.setPhase("run");
    expect(useExecutionStore.getState().phase).toBe("run");
  });

  it("resolves error on compile failure", () => {
    const store = useExecutionStore.getState();
    store.setRunning();
    store.setPhase("compile");
    store.setFinished(-1, false, true);

    const state = useExecutionStore.getState();
    expect(state.status).toBe("error");
    expect(state.compileFailed).toBe(true);
    expect(state.phase).toBeNull();
  });

  it("reset clears state", () => {
    const store = useExecutionStore.getState();
    store.setRunning();
    store.appendOutput("stdout", "data");
    store.reset();

    const state = useExecutionStore.getState();
    expect(state.status).toBe("idle");
    expect(state.stdout).toBe("");
  });
});
