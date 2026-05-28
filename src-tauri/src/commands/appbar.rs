use crate::core::{
    appbar::{
        get_appbar_status as read_appbar_status, register_appbar as register_window_appbar,
        unregister_appbar as unregister_window_appbar, AppBarStatus,
    },
    config::TaskbarPosition,
};

use super::NebulaError;

#[tauri::command]
pub fn get_appbar_status() -> Result<AppBarStatus, NebulaError> {
    read_appbar_status()
}

#[tauri::command]
pub fn register_appbar(
    window: tauri::Window,
    position: TaskbarPosition,
    thickness: u32,
) -> Result<AppBarStatus, NebulaError> {
    let hwnd = window.hwnd().map_err(|error| {
        NebulaError::with_detail(
            "appbar_hwnd_unavailable",
            "获取窗口句柄失败",
            error.to_string(),
        )
    })?;

    register_window_appbar(hwnd, position, thickness)
}

#[tauri::command]
pub fn unregister_appbar() -> Result<AppBarStatus, NebulaError> {
    unregister_window_appbar()
}
