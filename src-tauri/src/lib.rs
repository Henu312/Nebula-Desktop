mod commands;
mod core;
mod state;
mod utils;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::app::get_app_version,
            commands::app::launch_app,
            commands::config::get_config,
            commands::config::save_config,
            commands::storage::get_storage_status,
            commands::storage::list_pinned_apps,
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
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
