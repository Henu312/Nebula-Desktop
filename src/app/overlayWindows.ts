import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { currentMonitor, getCurrentWindow } from "@tauri-apps/api/window";

export type OverlayWindowLabel = "launcher" | "control-center";

export async function showOverlayWindow(label: OverlayWindowLabel) {
  if (!isTauriRuntime()) {
    return;
  }

  const window = await WebviewWindow.getByLabel(label);

  if (!window) {
    return;
  }

  const monitor = await currentMonitor();

  if (monitor) {
    await window.setPosition(monitor.position);
    await window.setSize(monitor.size);
  }

  await window.show();
  await window.setFocus();
}

export async function hideOverlayWindow(label: OverlayWindowLabel) {
  if (!isTauriRuntime()) {
    return;
  }

  const window = await WebviewWindow.getByLabel(label);
  await window?.hide();
}

export async function hideCurrentWindow() {
  if (!isTauriRuntime()) {
    return;
  }

  await getCurrentWindow().hide();
}

function isTauriRuntime() {
  return Boolean(
    (window as unknown as { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__,
  );
}
