use serde::Serialize;
use std::{
    collections::HashSet,
    ffi::OsStr,
    fs,
    os::windows::ffi::OsStrExt,
    path::{Path, PathBuf},
};
use windows::{
    core::PCWSTR,
    Win32::{UI::Shell::ShellExecuteW, UI::WindowsAndMessaging::SW_SHOWNORMAL},
};

use super::NebulaError;

#[derive(Debug, Serialize)]
pub struct AppVersion {
    pub name: String,
    pub version: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSearchResult {
    pub id: String,
    pub name: String,
    pub path: String,
}

#[tauri::command]
pub fn get_app_version() -> Result<AppVersion, NebulaError> {
    Ok(AppVersion {
        name: "Nebula Desktop".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}

#[tauri::command]
pub fn launch_app(path: String) -> Result<(), NebulaError> {
    let trimmed = path.trim();

    if trimmed.is_empty() {
        return Err(NebulaError::with_detail(
            "launch_path_empty",
            "启动路径不能为空",
            "path",
        ));
    }

    shell_open(trimmed, "launch_failed", "启动应用失败")
}

#[tauri::command]
pub fn open_windows_settings(page: String) -> Result<(), NebulaError> {
    let uri = match page.trim() {
        "wifi" => "ms-settings:network-wifi",
        "bluetooth" => "ms-settings:bluetooth",
        "display" => "ms-settings:display",
        "power" => "ms-settings:powersleep",
        "home" => "ms-settings:",
        value => {
            return Err(NebulaError::with_detail(
                "settings_page_unsupported",
                "不支持的系统设置页面",
                value,
            ));
        }
    };

    shell_open(uri, "settings_open_failed", "打开 Windows 设置失败")
}

#[tauri::command]
pub fn search_apps(query: String) -> Result<Vec<AppSearchResult>, NebulaError> {
    let query = query.trim().to_lowercase();
    let mut seen = HashSet::new();
    let mut results = Vec::new();

    for root in start_menu_roots() {
        collect_apps(&root, &query, &mut seen, &mut results)?;
    }

    results.sort_by(|left, right| left.name.cmp(&right.name));
    results.truncate(40);

    Ok(results)
}

fn shell_open(
    path: &str,
    error_code: &'static str,
    error_message: &'static str,
) -> Result<(), NebulaError> {
    let operation = to_wide("open");
    let file = to_wide(path);

    let result = unsafe {
        ShellExecuteW(
            None,
            PCWSTR(operation.as_ptr()),
            PCWSTR(file.as_ptr()),
            PCWSTR::null(),
            PCWSTR::null(),
            SW_SHOWNORMAL,
        )
    };

    if result.0 as isize <= 32 {
        return Err(NebulaError::with_detail(
            error_code,
            error_message,
            format!("ShellExecuteW returned {}", result.0 as isize),
        ));
    }

    Ok(())
}

fn start_menu_roots() -> Vec<PathBuf> {
    let mut roots = Vec::new();

    if let Some(appdata) = std::env::var_os("APPDATA") {
        roots.push(
            PathBuf::from(appdata)
                .join("Microsoft")
                .join("Windows")
                .join("Start Menu")
                .join("Programs"),
        );
    }

    if let Some(program_data) = std::env::var_os("PROGRAMDATA") {
        roots.push(
            PathBuf::from(program_data)
                .join("Microsoft")
                .join("Windows")
                .join("Start Menu")
                .join("Programs"),
        );
    }

    roots
}

fn collect_apps(
    root: &Path,
    query: &str,
    seen: &mut HashSet<String>,
    results: &mut Vec<AppSearchResult>,
) -> Result<(), NebulaError> {
    if !root.exists() {
        return Ok(());
    }

    let entries = fs::read_dir(root).map_err(|error| {
        NebulaError::with_detail(
            "app_search_read_dir_failed",
            "读取开始菜单目录失败",
            error.to_string(),
        )
    })?;

    for entry in entries {
        let entry = entry.map_err(|error| {
            NebulaError::with_detail(
                "app_search_entry_failed",
                "读取开始菜单条目失败",
                error.to_string(),
            )
        })?;
        let path = entry.path();

        if path.is_dir() {
            collect_apps(&path, query, seen, results)?;
            continue;
        }

        if !is_supported_app_entry(&path) {
            continue;
        }

        let Some(name) = app_name_from_path(&path) else {
            continue;
        };

        if !query.is_empty() && !name.to_lowercase().contains(query) {
            continue;
        }

        let path_text = path.display().to_string();

        if seen.insert(path_text.clone()) {
            results.push(AppSearchResult {
                id: path_text.clone(),
                name,
                path: path_text,
            });
        }
    }

    Ok(())
}

fn is_supported_app_entry(path: &Path) -> bool {
    matches!(
        path.extension()
            .and_then(|extension| extension.to_str())
            .map(|extension| extension.to_lowercase())
            .as_deref(),
        Some("lnk" | "exe" | "appref-ms")
    )
}

fn app_name_from_path(path: &Path) -> Option<String> {
    path.file_stem()
        .and_then(|name| name.to_str())
        .map(|name| name.trim().to_string())
        .filter(|name| !name.is_empty())
}

fn to_wide(value: &str) -> Vec<u16> {
    OsStr::new(value).encode_wide().chain(Some(0)).collect()
}
