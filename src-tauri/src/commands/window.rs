use crate::core::window::{
    activate_window_by_id, enumerate_running_apps, get_foreground_running_app,
    minimize_window_by_id, restore_window_by_id, RunningApp,
};

use super::NebulaError;

#[tauri::command]
pub fn get_running_apps() -> Result<Vec<RunningApp>, NebulaError> {
    enumerate_running_apps()
}

#[tauri::command]
pub fn get_foreground_window() -> Result<Option<RunningApp>, NebulaError> {
    get_foreground_running_app()
}

#[tauri::command]
pub fn activate_window(window_id: String) -> Result<(), NebulaError> {
    activate_window_by_id(&window_id)
}

#[tauri::command]
pub fn restore_window(window_id: String) -> Result<(), NebulaError> {
    restore_window_by_id(&window_id)
}

#[tauri::command]
pub fn minimize_window(window_id: String) -> Result<(), NebulaError> {
    minimize_window_by_id(&window_id)
}
