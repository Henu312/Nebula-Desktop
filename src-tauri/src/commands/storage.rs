use crate::core::storage::{
    initialize_storage, list_pinned_apps as read_pinned_apps,
    list_recent_items as read_recent_items, remove_pinned_app as delete_pinned_app,
    upsert_app_cache_item as write_app_cache_item, upsert_pinned_app as write_pinned_app,
    upsert_recent_item as write_recent_item, AppCacheItem, PinnedApp, RecentItem, StorageStatus,
};

use super::NebulaError;

#[tauri::command]
pub fn get_storage_status() -> Result<StorageStatus, NebulaError> {
    initialize_storage()
}

#[tauri::command]
pub fn list_pinned_apps() -> Result<Vec<PinnedApp>, NebulaError> {
    read_pinned_apps()
}

#[tauri::command]
pub fn upsert_pinned_app(app: PinnedApp) -> Result<(), NebulaError> {
    write_pinned_app(&app)
}

#[tauri::command]
pub fn remove_pinned_app(id: String) -> Result<(), NebulaError> {
    delete_pinned_app(&id)
}

#[tauri::command]
pub fn list_recent_items(limit: Option<i64>) -> Result<Vec<RecentItem>, NebulaError> {
    read_recent_items(limit.unwrap_or(12))
}

#[tauri::command]
pub fn upsert_recent_item(item: RecentItem) -> Result<(), NebulaError> {
    write_recent_item(&item)
}

#[tauri::command]
pub fn upsert_app_cache_item(item: AppCacheItem) -> Result<(), NebulaError> {
    write_app_cache_item(&item)
}
