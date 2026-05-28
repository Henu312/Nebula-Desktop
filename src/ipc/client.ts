import { invoke } from "@tauri-apps/api/core";
import type {
  AppCacheItem,
  AppConfig,
  AppVersion,
  PinnedApp,
  RecentItem,
  RunningApp,
  StorageStatus,
  SystemStatus,
} from "./types";

export async function getAppVersion(): Promise<AppVersion> {
  return invoke<AppVersion>("get_app_version");
}

export async function launchApp(path: string): Promise<void> {
  return invoke<void>("launch_app", { path });
}

export async function getSystemStatus(): Promise<SystemStatus> {
  return invoke<SystemStatus>("get_system_status");
}

export async function getConfig(): Promise<AppConfig> {
  return invoke<AppConfig>("get_config");
}

export async function saveConfig(config: AppConfig): Promise<AppConfig> {
  return invoke<AppConfig>("save_config", { config });
}

export async function getStorageStatus(): Promise<StorageStatus> {
  return invoke<StorageStatus>("get_storage_status");
}

export async function listPinnedApps(): Promise<PinnedApp[]> {
  return invoke<PinnedApp[]>("list_pinned_apps");
}

export async function upsertPinnedApp(app: PinnedApp): Promise<void> {
  return invoke<void>("upsert_pinned_app", { app });
}

export async function removePinnedApp(id: string): Promise<void> {
  return invoke<void>("remove_pinned_app", { id });
}

export async function upsertRecentItem(item: RecentItem): Promise<void> {
  return invoke<void>("upsert_recent_item", { item });
}

export async function upsertAppCacheItem(item: AppCacheItem): Promise<void> {
  return invoke<void>("upsert_app_cache_item", { item });
}

export async function getRunningApps(): Promise<RunningApp[]> {
  return invoke<RunningApp[]>("get_running_apps");
}

export async function getForegroundWindow(): Promise<RunningApp | null> {
  return invoke<RunningApp | null>("get_foreground_window");
}

export async function activateWindow(windowId: string): Promise<void> {
  return invoke<void>("activate_window", { windowId });
}

export async function restoreWindow(windowId: string): Promise<void> {
  return invoke<void>("restore_window", { windowId });
}

export async function minimizeWindow(windowId: string): Promise<void> {
  return invoke<void>("minimize_window", { windowId });
}
