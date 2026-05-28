mod commands;
mod core;
mod state;
mod utils;

use tauri::{Manager, WindowEvent};
use windows::Win32::UI::{
    Input::KeyboardAndMouse::{RegisterHotKey, MOD_ALT, VK_N},
    WindowsAndMessaging::{GetMessageW, MSG, WM_HOTKEY},
};

const EXIT_FALLBACK_DELAY_MS: u64 = 250;
const LAUNCHER_HOTKEY_ID: i32 = 1;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::app::get_app_version,
            commands::app::launch_app,
            commands::app::open_windows_settings,
            commands::app::search_apps,
            commands::appbar::get_appbar_status,
            commands::appbar::register_appbar,
            commands::appbar::unregister_appbar,
            commands::audio::get_volume,
            commands::audio::set_volume,
            commands::config::get_config,
            commands::config::save_config,
            commands::notification::get_notification_indicators,
            commands::storage::get_storage_status,
            commands::storage::list_pinned_apps,
            commands::storage::list_recent_items,
            commands::storage::remove_pinned_app,
            commands::storage::upsert_app_cache_item,
            commands::storage::upsert_pinned_app,
            commands::storage::upsert_recent_item,
            commands::system::get_system_status,
            commands::window::activate_window,
            commands::window::get_foreground_window,
            commands::window::get_running_apps,
            commands::window::minimize_window,
            commands::window::restore_window
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            start_global_hotkey_listener(app.handle().clone());
            Ok(())
        })
        .on_window_event(|window, event| match event {
            WindowEvent::CloseRequested { api, .. } if window.label() == "main" => {
                api.prevent_close();
                let _ = crate::core::appbar::unregister_appbar();
                if let Some(taskbar) = window.app_handle().get_webview_window("taskbar") {
                    let _ = taskbar.close();
                }
                request_app_exit(window.app_handle());
            }
            WindowEvent::CloseRequested { api, .. } if window.label() == "taskbar" => {
                api.prevent_close();
                let _ = crate::core::appbar::unregister_appbar();
                request_app_exit(window.app_handle());
            }
            WindowEvent::CloseRequested { api, .. } if is_aux_overlay(window.label()) => {
                api.prevent_close();
                let _ = window.hide();
            }
            WindowEvent::Destroyed if window.label() == "taskbar" => {
                let _ = crate::core::appbar::unregister_appbar();
            }
            WindowEvent::Destroyed if window.label() == "main" => {
                let _ = crate::core::appbar::unregister_appbar();
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn request_app_exit<R: tauri::Runtime>(app_handle: &tauri::AppHandle<R>) {
    app_handle.exit(0);

    std::thread::spawn(|| {
        std::thread::sleep(std::time::Duration::from_millis(EXIT_FALLBACK_DELAY_MS));
        std::process::exit(0);
    });
}

fn is_aux_overlay(label: &str) -> bool {
    matches!(label, "launcher" | "control-center")
}

fn start_global_hotkey_listener<R: tauri::Runtime>(app_handle: tauri::AppHandle<R>) {
    let _ = std::thread::Builder::new()
        .name("nebula-global-hotkey".to_string())
        .spawn(move || {
            if let Err(error) =
                unsafe { RegisterHotKey(None, LAUNCHER_HOTKEY_ID, MOD_ALT, VK_N.0 as u32) }
            {
                log::warn!("failed to register Alt+N hotkey: {error}");
                return;
            }

            let mut message = MSG::default();

            while unsafe { GetMessageW(&mut message, None, 0, 0).as_bool() } {
                if message.message == WM_HOTKEY && message.wParam.0 == LAUNCHER_HOTKEY_ID as usize {
                    show_launcher_overlay(&app_handle);
                }
            }
        });
}

fn show_launcher_overlay<R: tauri::Runtime>(app_handle: &tauri::AppHandle<R>) {
    if let Some(control_center) = app_handle.get_webview_window("control-center") {
        let _ = control_center.hide();
    }

    if let Some(launcher) = app_handle.get_webview_window("launcher") {
        let _ = launcher.show();
        let _ = launcher.set_focus();
    }
}
