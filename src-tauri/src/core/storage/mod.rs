use std::{fs, path::PathBuf};

use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};

use crate::commands::NebulaError;

const DATA_DIR_NAME: &str = "Nebula Desktop";
const DATABASE_FILE_NAME: &str = "nebula.db";

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StorageStatus {
    pub path: String,
    pub tables: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PinnedApp {
    pub id: String,
    pub name: String,
    pub path: String,
    pub icon_path: Option<String>,
    pub sort_order: i64,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RecentItem {
    pub id: String,
    pub kind: String,
    pub title: String,
    pub path: String,
    pub last_opened_at: i64,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppCacheItem {
    pub id: String,
    pub name: String,
    pub path: String,
    pub icon_cache_key: Option<String>,
    pub updated_at: i64,
}

pub fn initialize_storage() -> Result<StorageStatus, NebulaError> {
    let path = database_file_path()?;
    let parent = path.parent().ok_or_else(|| {
        NebulaError::with_detail(
            "storage_path_invalid",
            "数据库路径无效",
            path.display().to_string(),
        )
    })?;

    fs::create_dir_all(parent).map_err(|error| {
        NebulaError::with_detail(
            "storage_dir_create_failed",
            "创建数据库目录失败",
            error.to_string(),
        )
    })?;

    let connection = open_connection()?;
    create_schema(&connection)?;

    Ok(StorageStatus {
        path: path.display().to_string(),
        tables: list_tables(&connection)?,
    })
}

pub fn list_pinned_apps() -> Result<Vec<PinnedApp>, NebulaError> {
    let connection = open_ready_connection()?;
    let mut statement = connection
        .prepare(
            "SELECT id, name, path, icon_path, sort_order, created_at, updated_at
             FROM pinned_apps
             ORDER BY sort_order ASC, name ASC",
        )
        .map_err(storage_error(
            "storage_prepare_failed",
            "准备固定应用查询失败",
        ))?;

    let rows = statement
        .query_map([], |row| {
            Ok(PinnedApp {
                id: row.get(0)?,
                name: row.get(1)?,
                path: row.get(2)?,
                icon_path: row.get(3)?,
                sort_order: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })
        .map_err(storage_error("storage_query_failed", "查询固定应用失败"))?;

    rows.collect::<Result<Vec<_>, _>>()
        .map_err(storage_error("storage_row_map_failed", "读取固定应用失败"))
}

pub fn upsert_pinned_app(app: &PinnedApp) -> Result<(), NebulaError> {
    let connection = open_ready_connection()?;
    connection
        .execute(
            "INSERT INTO pinned_apps
             (id, name, path, icon_path, sort_order, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
             ON CONFLICT(id) DO UPDATE SET
               name = excluded.name,
               path = excluded.path,
               icon_path = excluded.icon_path,
               sort_order = excluded.sort_order,
               updated_at = excluded.updated_at",
            params![
                app.id,
                app.name,
                app.path,
                app.icon_path,
                app.sort_order,
                app.created_at,
                app.updated_at
            ],
        )
        .map_err(storage_error("storage_write_failed", "保存固定应用失败"))?;

    Ok(())
}

pub fn remove_pinned_app(id: &str) -> Result<(), NebulaError> {
    let connection = open_ready_connection()?;
    connection
        .execute("DELETE FROM pinned_apps WHERE id = ?1", params![id])
        .map_err(storage_error("storage_delete_failed", "删除固定应用失败"))?;

    Ok(())
}

pub fn list_recent_items(limit: i64) -> Result<Vec<RecentItem>, NebulaError> {
    let connection = open_ready_connection()?;
    let safe_limit = limit.clamp(1, 50);
    let mut statement = connection
        .prepare(
            "SELECT id, kind, title, path, last_opened_at
             FROM recent_items
             ORDER BY last_opened_at DESC, title ASC
             LIMIT ?1",
        )
        .map_err(storage_error(
            "storage_prepare_failed",
            "准备最近项目查询失败",
        ))?;

    let rows = statement
        .query_map(params![safe_limit], |row| {
            Ok(RecentItem {
                id: row.get(0)?,
                kind: row.get(1)?,
                title: row.get(2)?,
                path: row.get(3)?,
                last_opened_at: row.get(4)?,
            })
        })
        .map_err(storage_error("storage_query_failed", "查询最近项目失败"))?;

    rows.collect::<Result<Vec<_>, _>>()
        .map_err(storage_error("storage_row_map_failed", "读取最近项目失败"))
}

pub fn upsert_recent_item(item: &RecentItem) -> Result<(), NebulaError> {
    let connection = open_ready_connection()?;
    connection
        .execute(
            "INSERT INTO recent_items
             (id, kind, title, path, last_opened_at)
             VALUES (?1, ?2, ?3, ?4, ?5)
             ON CONFLICT(id) DO UPDATE SET
               kind = excluded.kind,
               title = excluded.title,
               path = excluded.path,
               last_opened_at = excluded.last_opened_at",
            params![
                item.id,
                item.kind,
                item.title,
                item.path,
                item.last_opened_at
            ],
        )
        .map_err(storage_error("storage_write_failed", "保存最近项目失败"))?;

    Ok(())
}

pub fn upsert_app_cache_item(item: &AppCacheItem) -> Result<(), NebulaError> {
    let connection = open_ready_connection()?;
    connection
        .execute(
            "INSERT INTO app_cache
             (id, name, path, icon_cache_key, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5)
             ON CONFLICT(id) DO UPDATE SET
               name = excluded.name,
               path = excluded.path,
               icon_cache_key = excluded.icon_cache_key,
               updated_at = excluded.updated_at",
            params![
                item.id,
                item.name,
                item.path,
                item.icon_cache_key,
                item.updated_at
            ],
        )
        .map_err(storage_error("storage_write_failed", "保存应用缓存失败"))?;

    Ok(())
}

fn open_ready_connection() -> Result<Connection, NebulaError> {
    let connection = open_connection()?;
    create_schema(&connection)?;
    Ok(connection)
}

fn open_connection() -> Result<Connection, NebulaError> {
    let path = database_file_path()?;
    Connection::open(path).map_err(storage_error("storage_open_failed", "打开数据库失败"))
}

fn create_schema(connection: &Connection) -> Result<(), NebulaError> {
    connection
        .execute_batch(
            "
            CREATE TABLE IF NOT EXISTS pinned_apps (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              path TEXT NOT NULL,
              icon_path TEXT,
              sort_order INTEGER NOT NULL DEFAULT 0,
              created_at INTEGER NOT NULL,
              updated_at INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS recent_items (
              id TEXT PRIMARY KEY,
              kind TEXT NOT NULL,
              title TEXT NOT NULL,
              path TEXT NOT NULL,
              last_opened_at INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS app_cache (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              path TEXT NOT NULL,
              icon_cache_key TEXT,
              updated_at INTEGER NOT NULL
            );
            ",
        )
        .map_err(storage_error("storage_schema_failed", "初始化数据库表失败"))
}

fn list_tables(connection: &Connection) -> Result<Vec<String>, NebulaError> {
    let mut statement = connection
        .prepare(
            "SELECT name
             FROM sqlite_master
             WHERE type = 'table'
               AND name NOT LIKE 'sqlite_%'
             ORDER BY name ASC",
        )
        .map_err(storage_error(
            "storage_prepare_failed",
            "准备表列表查询失败",
        ))?;

    let rows = statement
        .query_map([], |row| row.get::<_, String>(0))
        .map_err(storage_error("storage_query_failed", "查询数据库表失败"))?;

    rows.collect::<Result<Vec<_>, _>>()
        .map_err(storage_error("storage_row_map_failed", "读取数据库表失败"))
}

fn database_file_path() -> Result<PathBuf, NebulaError> {
    let base = std::env::var_os("APPDATA")
        .or_else(|| std::env::var_os("LOCALAPPDATA"))
        .map(PathBuf::from)
        .ok_or_else(|| {
            NebulaError::with_detail(
                "storage_base_dir_missing",
                "无法定位 Windows 用户数据目录",
                "APPDATA and LOCALAPPDATA are missing",
            )
        })?;

    Ok(base.join(DATA_DIR_NAME).join(DATABASE_FILE_NAME))
}

fn storage_error(
    code: &'static str,
    message: &'static str,
) -> impl FnOnce(rusqlite::Error) -> NebulaError {
    move |error| NebulaError::with_detail(code, message, error.to_string())
}

#[cfg(test)]
mod tests {
    use std::time::{SystemTime, UNIX_EPOCH};

    use super::*;

    #[test]
    fn initializes_schema_and_pinned_app_crud() {
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("system time should be valid")
            .as_nanos();
        let root = std::env::temp_dir().join(format!("nebula-storage-test-{timestamp}"));

        std::env::set_var("APPDATA", &root);
        std::env::remove_var("LOCALAPPDATA");

        let status = initialize_storage().expect("storage should initialize");
        assert_eq!(
            status.tables,
            vec![
                "app_cache".to_string(),
                "pinned_apps".to_string(),
                "recent_items".to_string()
            ]
        );

        let app = PinnedApp {
            id: "terminal".to_string(),
            name: "Terminal".to_string(),
            path: "C:\\Windows\\System32\\cmd.exe".to_string(),
            icon_path: None,
            sort_order: 1,
            created_at: 1,
            updated_at: 1,
        };

        upsert_pinned_app(&app).expect("pinned app should be saved");
        let apps = list_pinned_apps().expect("pinned apps should be listed");
        assert_eq!(apps.len(), 1);
        assert_eq!(apps[0].id, "terminal");

        remove_pinned_app("terminal").expect("pinned app should be removed");
        let apps = list_pinned_apps().expect("pinned apps should be listed after delete");
        assert!(apps.is_empty());

        let recent = RecentItem {
            id: "app:notepad".to_string(),
            kind: "app".to_string(),
            title: "Notepad".to_string(),
            path: "notepad.exe".to_string(),
            last_opened_at: 2,
        };

        upsert_recent_item(&recent).expect("recent item should be saved");
        let recent_items = list_recent_items(10).expect("recent items should be listed");
        assert_eq!(recent_items.len(), 1);
        assert_eq!(recent_items[0].id, "app:notepad");

        let _ = fs::remove_dir_all(root);
    }
}
