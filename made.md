# Nebula Desktop 当前执行记录

## 1. 已读取的原始文档

已读取并理解：

- `需求文档.md`
- `技术文档.md`

核心约束：

- 项目定位为 Windows 桌面增强层，不是 Shell Replacement。
- 不替换 `explorer.exe`。
- 不 Hook Explorer。
- 不注入系统进程。
- 不接管 Windows Notification Center。
- 不读取微信、QQ、企业微信、钉钉等聊天内容。
- 不读取通知正文。
- 优先保证稳定、低占用、兼容微信/QQ。

## 2. 环境确认

已确认当前环境具备：

- Node.js `v24.13.0`
- npm `11.6.2`
- Rust `rustc 1.95.0`
- Cargo `1.95.0`
- Rust toolchain：`stable-x86_64-pc-windows-msvc`
- Tauri CLI：`tauri-cli 2.11.2`
- WebView2 Runtime：`148.0.3967.83`
- Visual Studio Build Tools 2022
- MSVC `14.42.34433`
- Windows SDK `10.0.22621.0`

系统版本判断：

- 注册表显示 `DisplayVersion=25H2`
- `CurrentBuild=26200`
- 按 Windows 11 Home 25H2 判断
- 文档已调整为同时支持 Windows 10 和 Windows 11

注意：

- `npm config get offline` 当前为 `true`
- npm 安装时使用过 `--offline=false --prefer-online`
- Cargo 安装依赖时使用过临时环境变量 `$env:CARGO_NET_OFFLINE='false'`

## 3. 已生成的 spec 文档

新增：

- `系统设计文档.md`
- `开发任务书.md`

后续根据用户要求，已将 spec 从仅 Windows 11 调整为 Windows 10 / Windows 11 双平台目标。

兼容基线：

- Windows 10 22H2 x64
- Windows 11 23H2 / 24H2 / 25H2 x64

设计原则：

- 核心能力以 Windows 10 可用 API 为基线。
- Windows 11 的 Mica、材质、圆角等只作为增强。
- Windows 10 必须提供视觉降级方案。
- 不依赖 Windows 11 独占 API 实现核心功能。

## 4. 已执行任务

当前已执行任务：

- `T0.1 创建项目骨架`

执行状态：

- 已完成

## 5. T0.1 已创建的前端文件

新增：

- `package.json`
- `package-lock.json`
- `index.html`
- `tsconfig.json`
- `vite.config.ts`
- `postcss.config.cjs`
- `tailwind.config.js`
- `src/main.tsx`
- `src/app/App.tsx`
- `src/styles/index.css`
- `src/vite-env.d.ts`
- `src/ui/shared/.gitkeep`
- `src/ui/taskbar/.gitkeep`
- `src/ui/launcher/.gitkeep`
- `src/ui/control-center/.gitkeep`
- `src/ipc/.gitkeep`
- `src/state/.gitkeep`
- `src/utils/.gitkeep`

前端技术栈：

- Vite
- React
- TypeScript
- TailwindCSS
- Framer Motion

`package.json` 中脚本：

```json
{
  "dev": "vite --host 127.0.0.1 --port 1420",
  "build": "tsc --noEmit && vite build",
  "preview": "vite preview --host 127.0.0.1 --port 1420",
  "tauri": "cargo tauri",
  "tauri:dev": "cargo tauri dev",
  "tauri:build": "cargo tauri build"
}
```

## 6. T0.1 已创建的 Tauri 文件

通过以下命令初始化：

```powershell
cargo tauri init --ci --app-name "Nebula Desktop" --window-title "Nebula Desktop" --frontend-dist "../dist" --dev-url "http://127.0.0.1:1420" --before-dev-command "npm run dev" --before-build-command "npm run build"
```

新增：

- `src-tauri/Cargo.toml`
- `src-tauri/Cargo.lock`
- `src-tauri/build.rs`
- `src-tauri/tauri.conf.json`
- `src-tauri/capabilities/default.json`
- `src-tauri/src/main.rs`
- `src-tauri/src/lib.rs`
- `src-tauri/icons/*`
- `src-tauri/target/*`

已修改默认模板信息：

- `src-tauri/Cargo.toml`
  - package name 改为 `nebula-desktop`
  - description 改为 `Windows 10 / Windows 11 desktop enhancement layer`
  - lib name 改为 `nebula_desktop_lib`
- `src-tauri/src/main.rs`
  - 调用改为 `nebula_desktop_lib::run()`
- `src-tauri/tauri.conf.json`
  - identifier 改为 `com.nebula.desktop`
  - window size 改为 `1100 x 720`

## 7. 已安装依赖

前端依赖安装完成。

执行过：

```powershell
npm install --offline=false --prefer-online
```

安装结果通过：

```powershell
npm ls --depth=0
```

关键版本：

- `@tauri-apps/api@2.11.0`
- `@tauri-apps/cli@2.11.2`
- `react@19.2.6`
- `react-dom@19.2.6`
- `vite@7.3.3`
- `typescript@5.9.3`
- `tailwindcss@3.4.19`
- `framer-motion@12.40.0`

Rust/Tauri 依赖安装和解析完成。

第一次执行：

```powershell
cargo check
```

失败原因：

- Cargo 使用 offline 模式。
- 离线缓存中没有 `tauri-plugin-log`。

随后执行：

```powershell
$env:CARGO_NET_OFFLINE='false'; cargo check
```

结果：

- 成功更新 crates.io index。
- 成功锁定 470 个 Rust packages。
- `cargo check` 通过。

## 8. 已执行验证

### 8.1 npm 依赖验证

执行：

```powershell
npm ls --depth=0
```

结果：

- 通过。

### 8.2 Rust 检查

执行：

```powershell
$env:CARGO_NET_OFFLINE='false'; cargo check
```

工作目录：

```text
D:\data\Nebula_Desktop\src-tauri
```

结果：

- 通过。

### 8.3 前端构建

普通权限下执行：

```powershell
npm run build
```

失败：

```text
Error: spawn EPERM
```

原因判断：

- 发生在 Vite 加载配置时启动 esbuild 子进程。
- 属于沙箱权限限制，不是项目代码错误。

提升权限后执行：

```powershell
npm run build
```

结果：

- 通过。
- 生成 `dist/`。

构建输出：

- `dist/index.html`
- `dist/assets/index-C8A974r8.css`
- `dist/assets/index-DJ7_UtuS.js`

### 8.4 Tauri debug 构建

执行：

```powershell
cargo tauri build --debug --no-bundle
```

结果：

- 通过。
- 已生成桌面程序：

```text
D:\data\Nebula_Desktop\src-tauri\target\debug\nebula-desktop.exe
```

## 9. 当前运行状态

已启动 Vite 开发服务。

URL：

```text
http://127.0.0.1:1420/
```

启动命令：

```powershell
npm run dev
```

日志文件：

- `vite-dev.log`
- `vite-dev.err.log`

验证：

```powershell
Invoke-WebRequest 'http://127.0.0.1:1420/' -UseBasicParsing -TimeoutSec 5
```

返回：

```text
200
```

注意：

- 普通沙箱下启动 Vite dev server 也会遇到 `spawn EPERM`。
- 使用提升权限启动后成功。

## 10. 当前项目结构概要

```text
Nebula_Desktop/
├─ node_modules/
├─ dist/
├─ src/
│  ├─ app/
│  │  └─ App.tsx
│  ├─ ipc/
│  ├─ state/
│  ├─ styles/
│  │  └─ index.css
│  ├─ ui/
│  │  ├─ control-center/
│  │  ├─ launcher/
│  │  ├─ shared/
│  │  └─ taskbar/
│  ├─ utils/
│  ├─ main.tsx
│  └─ vite-env.d.ts
├─ src-tauri/
│  ├─ capabilities/
│  ├─ icons/
│  ├─ src/
│  │  ├─ lib.rs
│  │  └─ main.rs
│  ├─ target/
│  ├─ build.rs
│  ├─ Cargo.lock
│  ├─ Cargo.toml
│  └─ tauri.conf.json
├─ index.html
├─ package.json
├─ package-lock.json
├─ postcss.config.cjs
├─ tailwind.config.js
├─ tsconfig.json
├─ vite.config.ts
├─ 需求文档.md
├─ 技术文档.md
├─ 系统设计文档.md
├─ 开发任务书.md
└─ made.md
```

## 11. 已知注意事项

1. 当前不是 Git 仓库。
2. npm 全局配置仍然是 offline：

```powershell
npm config get offline
```

返回：

```text
true
```

3. 后续 npm 安装依赖时需要使用：

```powershell
npm install --offline=false --prefer-online
```

或先显式关闭 npm offline。

4. 后续 Cargo 拉取新依赖时，如果继续受 offline 限制，需要使用：

```powershell
$env:CARGO_NET_OFFLINE='false'; cargo check
```

5. Vite/esbuild 在普通沙箱权限下会出现：

```text
Error: spawn EPERM
```

需要提升权限执行构建或 dev server。

## 12. 下一步建议

按照 `开发任务书.md`，下一个任务应执行：

- `T0.2 建立代码目录`

不过 T0.1 中已经提前创建了一部分前端基础目录：

- `src/app/`
- `src/ui/taskbar/`
- `src/ui/launcher/`
- `src/ui/control-center/`
- `src/ui/shared/`
- `src/ipc/`
- `src/state/`
- `src/styles/`
- `src/utils/`

T0.2 仍需要补齐后端目录：

- `src-tauri/src/commands/`
- `src-tauri/src/core/window/`
- `src-tauri/src/core/appbar/`
- `src-tauri/src/core/tray/`
- `src-tauri/src/core/audio/`
- `src-tauri/src/core/wifi/`
- `src-tauri/src/core/config/`
- `src-tauri/src/state/`
- `src-tauri/src/utils/`

## 13. T0.2 执行记录

当前已继续执行：

- `T0.2 建立代码目录`

执行状态：

- 已完成

### 13.1 后端目录和模块入口

新增 Rust 后端模块文件：

- `src-tauri/src/commands/mod.rs`
- `src-tauri/src/core/mod.rs`
- `src-tauri/src/core/window/mod.rs`
- `src-tauri/src/core/appbar/mod.rs`
- `src-tauri/src/core/tray/mod.rs`
- `src-tauri/src/core/audio/mod.rs`
- `src-tauri/src/core/wifi/mod.rs`
- `src-tauri/src/core/config/mod.rs`
- `src-tauri/src/state/mod.rs`
- `src-tauri/src/utils/mod.rs`

修改：

- `src-tauri/src/lib.rs`

修改内容：

```rust
mod commands;
mod core;
mod state;
mod utils;
```

目的：

- 建立后端模块边界。
- 为后续 `T1.1 IPC 基础设施`、`Window Manager`、`Config Manager`、`Audio`、`WiFi` 等任务预留稳定目录结构。

### 13.2 前端模块入口

新增前端模块入口文件：

- `src/app/routes.ts`
- `src/ui/index.ts`
- `src/ui/taskbar/index.ts`
- `src/ui/launcher/index.ts`
- `src/ui/control-center/index.ts`
- `src/ui/shared/index.ts`
- `src/ipc/index.ts`
- `src/state/index.ts`
- `src/utils/index.ts`

目的：

- 补齐前端模块导出入口。
- 为后续组件、IPC 封装、状态管理、工具函数提供稳定导入路径。

### 13.3 验证结果

执行：

```powershell
cargo check
```

普通权限第一次失败：

```text
failed to write ... rmeta: 拒绝访问。 (os error 5)
```

原因：

- 之前 Tauri debug 构建使用提升权限生成过 `src-tauri/target` 产物。
- 普通权限写入同一 target 产物时被拒绝。
- 不是代码错误。

提升权限后重新执行：

```powershell
cargo check
```

结果：

- 通过。

执行：

```powershell
npm run build
```

结果：

- 通过。
- Vite 构建成功。
- TypeScript 检查成功。

### 13.4 当前下一步

按照任务书，下一步应执行：

- `T0.3 配置开发命令`

不过 T0.1 已经提前写入了基础脚本：

- `dev`
- `build`
- `preview`
- `tauri`
- `tauri:dev`
- `tauri:build`

T0.3 仍可继续补：

- Rust 格式化脚本或说明。
- TypeScript 检查脚本。
- 前后端验证脚本。
- README 中的开发命令说明。

## 14. T0.3 执行记录

当前已继续执行：

- `T0.3 配置开发命令`

执行状态：

- 已完成

### 14.1 修改 package.json

修改：

- `package.json`

新增或补齐脚本：

```json
{
  "dev": "vite --host 127.0.0.1 --port 1420",
  "dev:frontend": "vite --host 127.0.0.1 --port 1420",
  "build": "tsc --noEmit && vite build",
  "build:frontend": "vite build",
  "preview": "vite preview --host 127.0.0.1 --port 1420",
  "typecheck": "tsc --noEmit",
  "check": "npm run typecheck && npm run rust:check",
  "rust:check": "cargo check --manifest-path src-tauri/Cargo.toml",
  "rust:fmt": "cargo fmt --manifest-path src-tauri/Cargo.toml",
  "rust:fmt:check": "cargo fmt --manifest-path src-tauri/Cargo.toml --check",
  "tauri": "cargo tauri",
  "tauri:dev": "cargo tauri dev",
  "tauri:build": "cargo tauri build",
  "tauri:build:debug": "cargo tauri build --debug --no-bundle"
}
```

### 14.2 新增 README

新增：

- `README.md`

内容包含：

- 项目定位。
- 已验证开发环境。
- Windows 10 / Windows 11 目标兼容环境。
- 常用开发命令。
- npm offline 注意事项。
- Cargo offline 注意事项。
- 沙箱下 Vite/esbuild `spawn EPERM` 注意事项。
- 项目边界：不替换 Explorer、不 Hook、不注入、不接管通知中心、不读取隐私内容。

### 14.3 Rust 格式化

执行：

```powershell
npm run rust:fmt:check
```

第一次失败：

- `src-tauri/build.rs`
- `src-tauri/src/lib.rs`
- `src-tauri/src/main.rs`

原因：

- Tauri 模板生成的缩进不符合 `rustfmt` 默认格式。

随后执行：

```powershell
npm run rust:fmt
```

结果：

- Rust 文件格式化完成。

再次执行：

```powershell
npm run rust:fmt:check
```

结果：

- 通过。

### 14.4 脚本验证

执行：

```powershell
npm run typecheck
```

结果：

- 通过。

执行：

```powershell
npm run check
```

结果：

- 通过。
- 内部执行了 `npm run typecheck` 和 `npm run rust:check`。

执行：

```powershell
npm run tauri:build:debug
```

结果：

- 通过。
- 内部执行了 `npm run build`。
- Vite 构建通过。
- Tauri debug 构建通过。
- 产物仍为：

```text
D:\data\Nebula_Desktop\src-tauri\target\debug\nebula-desktop.exe
```

### 14.5 当前下一步

按照任务书，M0 阶段已完成：

- `T0.1 创建项目骨架`
- `T0.2 建立代码目录`
- `T0.3 配置开发命令`

下一步应进入：

- `T1.1 IPC 基础设施`

建议从以下内容开始：

1. 定义统一错误结构。
2. 新增 `get_app_version()` Tauri Command。
3. 前端封装 `invoke` 调用。
4. 在 UI 上显示后端返回的版本信息。
5. 重新执行 `npm run check` 和 `npm run tauri:build:debug`。

## 15. T1.1 执行记录

当前已继续执行：

- `T1.1 IPC 基础设施`

执行状态：

- 已完成最小闭环

### 15.1 后端 IPC 命令

新增：

- `src-tauri/src/commands/error.rs`
- `src-tauri/src/commands/app.rs`
- `src-tauri/src/commands/system.rs`

修改：

- `src-tauri/src/commands/mod.rs`
- `src-tauri/src/lib.rs`

已实现命令：

```rust
get_app_version()
get_system_status()
```

命令返回结构：

- `AppVersion`
  - `name`
  - `version`
- `SystemStatus`
  - `platform`
  - `arch`
  - `debug`
- `NebulaError`
  - `code`
  - `message`
  - `detail`

Tauri command 注册方式：

```rust
.invoke_handler(tauri::generate_handler![
    commands::app::get_app_version,
    commands::system::get_system_status
])
```

注意：

- 曾尝试通过 `commands::get_app_version` re-export 路径注册命令。
- `tauri::generate_handler!` 无法通过该 re-export 路径找到宏生成的内部符号。
- 已改为引用原始模块路径 `commands::app::get_app_version` 和 `commands::system::get_system_status`。

### 15.2 前端 IPC 封装

新增：

- `src/ipc/types.ts`
- `src/ipc/client.ts`

修改：

- `src/ipc/index.ts`
- `src/app/App.tsx`

前端封装：

```ts
getAppVersion()
getSystemStatus()
```

UI 行为：

- Tauri 环境中调用 IPC 并显示版本、平台、架构。
- 浏览器预览环境中捕获 IPC 失败并显示 `browser` / `browser preview`。

### 15.3 验证和修复

执行：

```powershell
npm run check
```

第一次失败：

```text
cannot find __tauri_command_name_get_app_version in commands
cannot find __cmd__get_app_version in commands
```

原因：

- Tauri command 宏生成的内部符号不适合通过 re-export 注册。

修复：

- `commands/mod.rs` 中将 `app`、`system` 改为公开模块。
- `src-tauri/src/lib.rs` 中改为使用原始模块路径注册。

随后再次执行：

```powershell
npm run check
```

出现一个警告：

```text
associated function new is never used
```

修复：

- 删除暂未使用的 `NebulaError::new()`。

最终验证：

```powershell
npm run rust:fmt:check
npm run typecheck
npm run check
npm run tauri:build:debug
```

结果：

- 全部通过。
- Tauri debug 构建通过。
- 产物：

```text
D:\data\Nebula_Desktop\src-tauri\target\debug\nebula-desktop.exe
```

### 15.4 当前下一步

按照任务书，下一步应执行：

- `T1.2 Config Manager`

建议实现内容：

1. 定义默认配置结构。
2. 确定配置文件路径。
3. 实现配置读取。
4. 实现配置保存。
5. 暴露 `get_config()` 和 `save_config(config)` Tauri Commands。
6. 前端接入配置读取并显示当前主题、Taskbar 位置等基础配置。

## 16. T1.2 执行记录

当前已继续执行：

- `T1.2 Config Manager`

执行状态：

- 已完成基础配置读写和 IPC 接入

### 16.1 后端配置模块

修改：

- `src-tauri/src/core/config/mod.rs`

新增能力：

- `AppConfig`
- `TaskbarPosition`
- `Theme`
- 默认配置
- 配置读取 `load_config()`
- 配置保存 `save_config()`
- 配置基础校验
- Windows 用户配置路径解析

当前配置路径：

```text
%APPDATA%\Nebula Desktop\config.json
```

如果 `APPDATA` 不存在，则回退使用：

```text
%LOCALAPPDATA%\Nebula Desktop\config.json
```

默认配置：

```json
{
  "taskbarPosition": "top",
  "dockEnabled": false,
  "blur": true,
  "theme": "dark",
  "launcherHotkey": "Alt+Space",
  "taskbarThickness": 56
}
```

校验规则：

- `taskbarThickness` 必须在 `32..=96`。
- `launcherHotkey` 不能为空。

### 16.2 后端 IPC 命令

新增：

- `src-tauri/src/commands/config.rs`

修改：

- `src-tauri/src/commands/mod.rs`
- `src-tauri/src/lib.rs`
- `src-tauri/src/commands/error.rs`

已暴露命令：

```rust
get_config()
save_config(config)
```

错误结构增强：

- `NebulaError::with_detail(...)`

用于返回配置读写、解析、校验等错误详情。

### 16.3 前端接入

修改：

- `src/ipc/types.ts`
- `src/ipc/client.ts`
- `src/app/App.tsx`

新增前端类型：

- `TaskbarPosition`
- `Theme`
- `AppConfig`

新增 IPC client：

```ts
getConfig()
saveConfig(config)
```

UI 当前显示：

- IPC 状态。
- 应用版本。
- 运行平台和架构。
- 当前主题。
- 当前 Taskbar 位置。

浏览器预览环境中，如果 Tauri IPC 不可用，会继续显示 browser fallback。

### 16.4 验证结果

执行：

```powershell
npm run rust:fmt
npm run rust:fmt:check
npm run typecheck
npm run check
npm run tauri:build:debug
```

结果：

- 全部通过。
- Tauri debug 构建成功。
- 产物：

```text
D:\data\Nebula_Desktop\src-tauri\target\debug\nebula-desktop.exe
```

### 16.5 当前下一步

按照任务书，下一步应执行：

- `T1.3 Storage Layer`

建议实现内容：

1. 集成 SQLite。
2. 创建 `pinned_apps`、`recent_items`、`app_cache` 表。
3. 实现数据库初始化。
4. 实现基础 CRUD。
5. 为后续固定应用、Launcher 最近项目做准备。

## 17. T1.3 执行记录

当前已继续执行：

- `T1.3 Storage Layer`

执行状态：

- 已完成 SQLite 集成、表初始化、基础 CRUD 和 IPC 接入

### 17.1 新增依赖

修改：

- `src-tauri/Cargo.toml`
- `src-tauri/Cargo.lock`

新增 Rust 依赖：

```toml
rusqlite = { version = "0.37", features = ["bundled"] }
```

说明：

- 使用 `bundled` 特性，由 `libsqlite3-sys` 构建内置 SQLite。
- 避免依赖用户系统中是否单独安装 SQLite。

首次检查时执行：

```powershell
$env:CARGO_NET_OFFLINE='false'; npm run check
```

Cargo 下载并锁定：

- `rusqlite v0.37.0`
- `libsqlite3-sys v0.35.0`
- `hashlink`
- `fallible-iterator`
- `fallible-streaming-iterator`
- `vcpkg`

### 17.2 后端 Storage Layer

新增：

- `src-tauri/src/core/storage/mod.rs`

修改：

- `src-tauri/src/core/mod.rs`

数据库路径：

```text
%APPDATA%\Nebula Desktop\nebula.db
```

如果 `APPDATA` 不存在，则回退使用：

```text
%LOCALAPPDATA%\Nebula Desktop\nebula.db
```

新增数据结构：

- `StorageStatus`
- `PinnedApp`
- `RecentItem`
- `AppCacheItem`

初始化表：

```sql
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
```

已实现函数：

- `initialize_storage()`
- `list_pinned_apps()`
- `upsert_pinned_app(app)`
- `remove_pinned_app(id)`
- `upsert_recent_item(item)`
- `upsert_app_cache_item(item)`

### 17.3 后端 IPC 命令

新增：

- `src-tauri/src/commands/storage.rs`

修改：

- `src-tauri/src/commands/mod.rs`
- `src-tauri/src/lib.rs`

已暴露 Tauri Commands：

```rust
get_storage_status()
list_pinned_apps()
upsert_pinned_app(app)
remove_pinned_app(id)
upsert_recent_item(item)
upsert_app_cache_item(item)
```

说明：

- 起初只接入了 `get_storage_status()`。
- `cargo check` 提示 CRUD 类型和函数未使用。
- 随后将 CRUD 函数正式暴露为 IPC，既满足 T1.3 基础 CRUD，也保持 Rust 检查无警告。

### 17.4 前端接入

修改：

- `src/ipc/types.ts`
- `src/ipc/client.ts`
- `src/app/App.tsx`

新增前端类型：

- `StorageStatus`
- `PinnedApp`
- `RecentItem`
- `AppCacheItem`

新增 IPC client：

```ts
getStorageStatus()
listPinnedApps()
upsertPinnedApp(app)
removePinnedApp(id)
upsertRecentItem(item)
upsertAppCacheItem(item)
```

UI 当前显示：

- SQLite 表数量，例如 `SQLite: 3 tables`

### 17.5 单元测试

修改：

- `package.json`
- `src-tauri/src/core/storage/mod.rs`

新增脚本：

```json
{
  "rust:test": "cargo test --manifest-path src-tauri/Cargo.toml"
}
```

新增 Rust 单元测试：

```rust
initializes_schema_and_pinned_app_crud()
```

测试行为：

1. 临时将 `APPDATA` 指向系统临时目录。
2. 调用 `initialize_storage()`。
3. 验证三张表创建成功。
4. 插入一个固定应用。
5. 查询固定应用列表。
6. 删除固定应用。
7. 再次查询并确认为空。
8. 删除临时目录。

执行：

```powershell
npm run rust:test
```

结果：

- 1 个测试通过。

### 17.6 验证结果

执行：

```powershell
npm run rust:fmt
npm run rust:fmt:check
npm run typecheck
npm run rust:test
npm run check
npm run tauri:build:debug
```

结果：

- 全部通过。
- Rust 检查无警告。
- Tauri debug 构建通过。
- 产物：

```text
D:\data\Nebula_Desktop\src-tauri\target\debug\nebula-desktop.exe
```

### 17.7 当前下一步

按照任务书，下一步应执行：

- `T1.4 Window Manager 初版`

建议实现内容：

1. 引入 Windows API 依赖。
2. 枚举顶层窗口。
3. 获取窗口标题。
4. 获取进程 ID。
5. 获取前台窗口。
6. 获取窗口最小化状态。
7. 过滤不可见窗口、无标题窗口和系统噪声窗口。
8. 暴露 `get_running_apps()` 和 `get_foreground_window()` IPC。

## 18. T1.4 执行记录

当前已继续执行：

- `T1.4 Window Manager 初版`

执行状态：

- 已完成 Win32 窗口枚举、前台窗口、最小化状态和 IPC 接入

### 18.1 新增依赖

修改：

- `src-tauri/Cargo.toml`
- `src-tauri/Cargo.lock`

新增 Rust 依赖：

```toml
windows = { version = "0.61", features = [
  "Win32_Foundation",
  "Win32_System_Threading",
  "Win32_UI_WindowsAndMessaging"
] }
```

使用到的 Win32 API：

- `EnumWindows`
- `GetWindowTextLengthW`
- `GetWindowTextW`
- `GetWindowThreadProcessId`
- `GetForegroundWindow`
- `GetWindowPlacement`
- `IsWindowVisible`
- `IsIconic`
- `OpenProcess`
- `QueryFullProcessImageNameW`
- `CloseHandle`

### 18.2 后端 Window Manager

修改：

- `src-tauri/src/core/window/mod.rs`

新增结构：

```rust
RunningApp {
  window_id,
  title,
  process_id,
  process_path,
  is_foreground,
  is_minimized
}
```

新增能力：

- 枚举当前可见顶层窗口。
- 读取窗口标题。
- 获取窗口所属进程 ID。
- 尝试读取进程路径。
- 标记当前前台窗口。
- 判断窗口是否最小化。
- 过滤空标题窗口。
- 过滤部分噪声窗口标题，例如 `Program Manager`、`Windows 输入体验`。

实现函数：

- `enumerate_running_apps()`
- `get_foreground_running_app()`

说明：

- `window_id` 使用 HWND 的十六进制字符串表示，避免直接把 64 位窗口句柄作为 JS number 传输。
- 进程路径读取失败时返回 `None`，不影响窗口枚举。

### 18.3 后端 IPC 命令

新增：

- `src-tauri/src/commands/window.rs`

修改：

- `src-tauri/src/commands/mod.rs`
- `src-tauri/src/lib.rs`

新增 Tauri Commands：

```rust
get_running_apps()
get_foreground_window()
```

注册方式：

```rust
commands::window::get_running_apps
commands::window::get_foreground_window
```

### 18.4 前端接入

修改：

- `src/ipc/types.ts`
- `src/ipc/client.ts`
- `src/app/App.tsx`

新增前端类型：

- `RunningApp`

新增 IPC client：

```ts
getRunningApps()
getForegroundWindow()
```

UI 当前显示：

- 当前枚举到的窗口数量，例如 `Windows: 8 apps`
- 当前活动窗口标题，例如 `Active: Visual Studio Code`

浏览器预览环境中，如果 Tauri IPC 不可用，仍保持 browser fallback。

### 18.5 验证结果

执行：

```powershell
npm run rust:fmt
npm run rust:fmt:check
npm run typecheck
$env:CARGO_NET_OFFLINE='false'; npm run check
npm run rust:test
npm run tauri:build:debug
```

结果：

- 全部通过。
- Rust 检查无警告。
- 现有 SQLite 单元测试仍通过。
- Tauri debug 构建通过。
- 产物：

```text
D:\data\Nebula_Desktop\src-tauri\target\debug\nebula-desktop.exe
```

注意：

- `npm run rust:test` 和 `npm run tauri:build:debug` 曾并行执行。
- Tauri 构建期间出现 `Blocking waiting for file lock on artifact directory`。
- 这是 Rust `target` 目录并发访问导致的等待，不是构建失败。
- 最终两个命令均执行成功。

### 18.6 当前下一步

按照任务书，M1 后端基础能力已经完成：

- `T1.1 IPC 基础设施`
- `T1.2 Config Manager`
- `T1.3 Storage Layer`
- `T1.4 Window Manager 初版`

下一步应进入：

- `M2 Taskbar 初版`

建议从以下任务开始：

1. `T2.1 Taskbar 布局`
2. 实现 Taskbar 主组件。
3. 支持 Top 和 Bottom。
4. 预留 Left 和 Right 布局接口。
5. 使用当前 `get_running_apps()` 的结果展示运行应用状态。

## 19. T2.1 执行记录

当前已继续执行：

- `T2.1 Taskbar 布局`

执行状态：

- 已完成 Taskbar UI 初版和桌面层首屏改造

### 19.1 新增 Taskbar 组件

新增：

- `src/ui/taskbar/taskbar.types.ts`
- `src/ui/taskbar/Taskbar.tsx`
- `src/ui/taskbar/TaskbarItem.tsx`
- `src/ui/taskbar/TaskbarStatusArea.tsx`

修改：

- `src/ui/taskbar/index.ts`

实现能力：

- 支持 `top`、`bottom`、`left`、`right` 四种布局接口。
- Top / Bottom 使用横向 Taskbar。
- Left / Right 使用纵向 Taskbar。
- 固定尺寸图标按钮，避免 hover 时布局跳动。
- Hover / tap 动效使用 Framer Motion。
- 活动窗口使用高亮指示条。
- 最小化窗口使用暖色状态点。
- 状态区显示 IPC 状态、窗口数量、版本号或时间。
- 使用半透明、边框、阴影和 `backdrop-blur`，兼容 Windows 10 降级视觉，不依赖 Windows 11 Mica。

### 19.2 改造 App 首屏

修改：

- `src/app/App.tsx`

改动：

- 删除原来的说明型骨架页面。
- 改为真实桌面层布局：
  - 背景工作区。
  - 常驻 Taskbar。
  - 活动窗口预览。
  - 配置状态面板。
  - Storage 状态面板。
- Tauri 环境中读取真实 IPC：
  - `getAppVersion()`
  - `getSystemStatus()`
  - `getConfig()`
  - `getStorageStatus()`
  - `getRunningApps()`
  - `getForegroundWindow()`
- 浏览器预览环境中使用 fallback 数据，保证 `http://127.0.0.1:1420/` 也能看到 Taskbar 效果。

### 19.3 当前 UI 行为

Taskbar 使用配置：

```ts
appConfig.taskbarPosition
```

默认浏览器预览配置：

```ts
{
  taskbarPosition: "top",
  dockEnabled: false,
  blur: true,
  theme: "dark",
  launcherHotkey: "Alt+Space",
  taskbarThickness: 56
}
```

浏览器 fallback 运行应用：

- Visual Studio Code
- Windows Terminal
- Microsoft Edge

Tauri 运行时则显示真实窗口列表。

### 19.4 验证结果

执行：

```powershell
npm run typecheck
npm run rust:fmt:check
npm run build
npm run check
npm run tauri:build:debug
```

结果：

- 全部通过。
- Vite 构建通过。
- Rust 检查通过。
- Tauri debug 构建通过。
- 产物：

```text
D:\data\Nebula_Desktop\src-tauri\target\debug\nebula-desktop.exe
```

### 19.5 当前下一步

按照任务书，下一步应执行：

- `T2.2 固定应用`

建议实现内容：

1. 使用 SQLite `pinned_apps` 表读取固定应用。
2. 增加默认固定应用 fallback。
3. Taskbar 分区显示固定应用和运行应用。
4. 点击固定应用启动程序。
5. 固定应用不存在时显示明确状态。

## 20. T2.2 执行记录

当前已继续执行：

- `T2.2 固定应用`

执行状态：

- 已完成固定应用 UI、SQLite 读取接入和启动应用 IPC

### 20.1 后端启动应用 IPC

修改：

- `src-tauri/src/commands/app.rs`
- `src-tauri/src/lib.rs`

新增 Tauri Command：

```rust
launch_app(path)
```

行为：

- 校验启动路径不能为空。
- 使用 `std::process::Command::new(path).spawn()` 启动程序。
- 启动失败时返回 `NebulaError`。

当前用于固定应用点击启动。

### 20.2 前端 IPC 接入

修改：

- `src/ipc/client.ts`

新增：

```ts
launchApp(path)
```

已有 Storage IPC 被用于读取固定应用：

```ts
listPinnedApps()
```

### 20.3 Taskbar 固定应用 UI

新增：

- `src/ui/taskbar/TaskbarPinnedItem.tsx`

修改：

- `src/ui/taskbar/taskbar.types.ts`
- `src/ui/taskbar/Taskbar.tsx`
- `src/ui/taskbar/index.ts`

实现能力：

- Taskbar 拆分为固定应用区和运行应用区。
- 固定应用使用独立高亮样式。
- 固定应用和运行应用之间有分隔线。
- 固定应用支持横向和纵向 Taskbar。
- 点击固定应用触发 `onLaunchPinnedApp(app)`。
- 固定应用按钮有稳定 `44x44` 尺寸，Hover 不造成布局跳动。

### 20.4 App 接入固定应用

修改：

- `src/app/App.tsx`

新增状态：

- `pinnedApps`
- `launchMessage`

Tauri 环境：

- 调用 `listPinnedApps()` 读取 SQLite 中的固定应用。
- 如果 SQLite 为空，使用 fallback 固定应用。
- 点击固定应用调用 `launchApp(app.path)`。

浏览器预览环境：

- 使用 fallback 固定应用。
- 点击固定应用不会真实启动程序，只更新状态文本。

fallback 固定应用：

- `explorer.exe`
- `wt.exe`
- `msedge.exe`
- `notepad.exe`

当前 UI 显示：

- 固定应用数量，例如 `Pinned: 4 apps`
- 启动状态，例如 `Terminal launched` 或 `Terminal launch failed`

### 20.5 验证结果

执行：

```powershell
npm run typecheck
npm run rust:fmt
npm run rust:fmt:check
npm run build
npm run check
npm run tauri:build:debug
npm run rust:test
```

结果：

- 全部通过。
- Rust 检查无警告。
- Vite 构建通过。
- Tauri debug 构建通过。
- Storage 单元测试仍通过。
- 产物：

```text
D:\data\Nebula_Desktop\src-tauri\target\debug\nebula-desktop.exe
```

### 20.6 当前下一步

按照任务书，下一步应执行：

- `T2.3 运行应用显示`

说明：

- 当前 Taskbar 已经显示运行应用。
- 但仍属于基础接入，还没有做周期刷新、窗口开关后的状态更新、同应用多窗口策略、运行应用和固定应用去重。

建议实现内容：

1. 周期性刷新 `get_running_apps()`。
2. 前台窗口变化后刷新 active 状态。
3. 固定应用和运行应用去重或关联。
4. 优化运行应用标题显示和 Tooltip。
5. 为后续点击运行应用激活窗口做准备。

## 21. T2.3 执行记录

当前已继续执行：

- `T2.3 运行应用显示`

执行状态：

- 已完成运行应用低频刷新和固定应用运行态标记

### 21.1 运行应用低频刷新

修改：

- `src/app/App.tsx`

新增常量：

```ts
const WINDOW_REFRESH_INTERVAL_MS = 2_500;
```

新增行为：

- Tauri IPC 进入 `ready` 后，每 2.5 秒刷新一次：
  - `getRunningApps()`
  - `getForegroundWindow()`
- 刷新结果用于更新：
  - `runningApps`
  - `foregroundWindow`
- 刷新失败时更新状态文本：
  - `Window refresh failed`

说明：

- 2.5 秒属于低频刷新，用作 MVP 阶段兜底方案。
- 后续可替换为 Win32 事件驱动或后端事件推送，避免长期轮询。

### 21.2 启动后刷新

修改：

- `src/app/App.tsx`

点击固定应用并成功调用 `launchApp(app.path)` 后：

- 800ms 后再次调用：
  - `getRunningApps()`
  - `getForegroundWindow()`
- 用于更快反映新启动应用状态。

失败时显示：

```text
<应用名> launched, refresh failed
```

### 21.3 固定应用运行态标记

修改：

- `src/ui/taskbar/taskbar.types.ts`
- `src/ui/taskbar/TaskbarPinnedItem.tsx`
- `src/ui/taskbar/Taskbar.tsx`

新增 props：

```ts
isRunning
isForeground
```

实现行为：

- 固定应用对应进程正在运行时，显示运行指示。
- 固定应用对应进程是前台窗口时，显示额外状态点。
- 通过可执行文件名匹配：
  - 固定应用 `path`
  - 运行应用 `processPath`

辅助函数：

```ts
executableName(path)
isPinnedAppRunning(path, runningApps)
isPinnedAppForeground(path, runningApps)
```

### 21.4 验证结果

执行：

```powershell
npm run typecheck
npm run rust:fmt:check
npm run build
npm run check
npm run tauri:build:debug
```

结果：

- 全部通过。
- Vite 构建通过。
- Rust 检查通过。
- Tauri debug 构建通过。
- 产物：

```text
D:\data\Nebula_Desktop\src-tauri\target\debug\nebula-desktop.exe
```

### 21.5 当前下一步

按照任务书，下一步应执行：

- `T2.4 窗口激活控制`

建议实现内容：

1. 后端实现 `activate_window(window_id)`。
2. 后端实现 `restore_window(window_id)`。
3. 后端实现 `minimize_window(window_id)`。
4. 前端点击运行应用图标时激活或还原窗口。
5. 最小化窗口点击后还原。

## 22. T2.4 执行记录

当前已继续执行：

- `T2.4 窗口激活控制`

执行状态：

- 已完成运行应用点击激活、还原和最小化 IPC 基础能力

### 22.1 后端窗口控制

修改：

- `src-tauri/src/core/window/mod.rs`
- `src-tauri/src/commands/window.rs`
- `src-tauri/src/lib.rs`

新增 Win32 API 使用：

- `SetForegroundWindow`
- `ShowWindow`
- `SW_RESTORE`
- `SW_MINIMIZE`

新增后端函数：

```rust
activate_window_by_id(window_id)
restore_window_by_id(window_id)
minimize_window_by_id(window_id)
```

新增窗口 ID 解析：

```rust
hwnd_from_id(window_id)
```

说明：

- `window_id` 仍使用 HWND 的十六进制字符串。
- 后端将该字符串解析回 `HWND`。
- `ShowWindow` 返回值是窗口之前的可见状态，不作为失败判断。
- `SetForegroundWindow` 可能被 Windows 前台锁拒绝；失败时返回 `window_activate_failed`。

### 22.2 后端 IPC 命令

新增 Tauri Commands：

```rust
activate_window(window_id)
restore_window(window_id)
minimize_window(window_id)
```

注册到 `tauri::generate_handler!`：

```rust
commands::window::activate_window
commands::window::restore_window
commands::window::minimize_window
```

### 22.3 前端 IPC 接入

修改：

- `src/ipc/client.ts`

新增：

```ts
activateWindow(windowId)
restoreWindow(windowId)
minimizeWindow(windowId)
```

其中 `minimizeWindow` 已封装，当前 UI 暂未触发，给后续操作菜单或中键点击预留。

### 22.4 Taskbar 点击运行应用

修改：

- `src/ui/taskbar/taskbar.types.ts`
- `src/ui/taskbar/TaskbarItem.tsx`
- `src/ui/taskbar/Taskbar.tsx`
- `src/app/App.tsx`

新增行为：

- 点击运行应用图标时触发 `onActivateRunningApp(app)`。
- 浏览器预览环境中只在本地切换前台状态。
- Tauri 环境中：
  - 如果窗口已最小化，调用 `restoreWindow(app.windowId)`。
  - 否则调用 `activateWindow(app.windowId)`。
  - 成功后 250ms 刷新 `getRunningApps()` 和 `getForegroundWindow()`。

状态文本：

- 成功：`<窗口标题> active`
- 失败：`<窗口标题> activate failed`
- 成功但刷新失败：`<窗口标题> active, refresh failed`

### 22.5 验证结果

执行：

```powershell
npm run rust:fmt
npm run typecheck
npm run rust:fmt:check
npm run check
npm run build
npm run rust:test
npm run tauri:build:debug
```

结果：

- 全部通过。
- Rust 检查无警告。
- Vite 构建通过。
- Rust 测试通过。
- Tauri debug 构建通过。
- 产物：

```text
D:\data\Nebula_Desktop\src-tauri\target\debug\nebula-desktop.exe
```

注意：

- `npm run rust:test` 和 `npm run tauri:build:debug` 曾并行执行。
- Tauri 构建等待了一次 Rust `target` 文件锁。
- 最终构建成功。

### 22.6 当前下一步

按照任务书，M2 Taskbar 初版已完成：

- `T2.1 Taskbar 布局`
- `T2.2 固定应用`
- `T2.3 运行应用显示`
- `T2.4 窗口激活控制`

下一步应进入：

- `M3 Launcher 初版`

建议从 `T3.1 Launcher UI` 开始：

1. 实现 Spotlight/Raycast 风格输入框。
2. 实现结果列表。
3. 支持键盘上下选择。
4. 支持 Enter 执行。
5. 支持 Esc 关闭。
6. 先接入固定应用和运行应用作为搜索结果。

## 23. T3.1 执行记录

当前已继续执行：

- `T3.1 Launcher UI`

执行状态：

- 已完成 Launcher UI、键盘交互和基础执行闭环

### 23.1 新增 Launcher 组件

新增：

- `src/ui/launcher/launcher.types.ts`
- `src/ui/launcher/Launcher.tsx`
- `src/ui/launcher/LauncherInput.tsx`
- `src/ui/launcher/LauncherResultList.tsx`
- `src/ui/launcher/LauncherResultItem.tsx`

修改：

- `src/ui/launcher/index.ts`

实现能力：

- Spotlight / Raycast 风格居中浮层。
- 搜索输入框。
- 结果列表。
- 空结果状态。
- 结果选中态。
- Framer Motion 打开/关闭动画。
- 点击遮罩关闭。
- 点击结果执行。

### 23.2 结果来源

当前 Launcher 先使用已有数据作为结果源：

- 固定应用 `pinnedApps`
- 运行应用 `runningApps`

结果类型：

```ts
LauncherResult =
  | { kind: "pinned"; app: PinnedApp }
  | { kind: "running"; app: RunningApp }
```

搜索逻辑：

- 对 `title` 和 `subtitle` 做小写包含匹配。
- 空查询显示默认结果。
- 最多显示 8 条结果。

说明：

- 这一步先完成 T3.1 UI 和交互。
- 后续 `T3.2 应用搜索` 会接入开始菜单快捷方式扫描和真实应用搜索。

### 23.3 键盘操作

已支持：

- `Alt+Space`：打开/关闭 Launcher。
- `ArrowDown`：选择下一项。
- `ArrowUp`：选择上一项。
- `Enter`：执行当前选中项。
- `Esc`：关闭 Launcher。

执行行为：

- 固定应用结果：调用 `onLaunchPinnedApp(app)`。
- 运行应用结果：调用 `onActivateRunningApp(app)`。
- 执行后关闭 Launcher。

### 23.4 Taskbar 接入

修改：

- `src/ui/taskbar/taskbar.types.ts`
- `src/ui/taskbar/Taskbar.tsx`
- `src/app/App.tsx`

新增：

```ts
onOpenLauncher()
```

行为：

- 点击 Taskbar 左侧 Nebula `N` 按钮打开 Launcher。

### 23.5 App 接入

修改：

- `src/app/App.tsx`

新增状态：

```ts
launcherOpen
```

新增行为：

- 全局监听 `keydown`。
- `Alt+Space` 切换 Launcher。
- 向 Launcher 传入：
  - `pinnedApps`
  - `runningApps`
  - `handleLaunchPinnedApp`
  - `handleActivateRunningApp`

### 23.6 验证结果

执行：

```powershell
npm run typecheck
npm run rust:fmt:check
npm run build
npm run check
npm run tauri:build:debug
```

结果：

- 全部通过。
- Vite 构建通过。
- Rust 检查通过。
- Tauri debug 构建通过。
- 产物：

```text
D:\data\Nebula_Desktop\src-tauri\target\debug\nebula-desktop.exe
```

### 23.7 当前下一步

按照任务书，下一步应执行：

- `T3.2 应用搜索`

建议实现内容：

1. 扫描开始菜单快捷方式。
2. 建立应用索引。
3. 暴露 `search_apps(query)`。
4. 暴露 `launch_app(app_id)` 或复用当前 `launch_app(path)`。
5. Launcher 接入真实应用搜索结果。
